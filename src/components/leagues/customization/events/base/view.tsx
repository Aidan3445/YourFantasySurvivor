'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '~/components/common/form';
import { Button } from '~/components/common/button';
import { useEffect, useState } from 'react';
import { Lock, LockOpen } from 'lucide-react';
import ChallengeScoreSettings from '~/components/leagues/customization/events/base/challenges';
import AdvantageScoreSettings from '~/components/leagues/customization/events/base/advantages';
import OtherScoreSettings from '~/components/leagues/customization/events/base/other';
import { BaseEventRulesZod, BasePredictionRulesZod } from '~/types/leagues';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import { defaultBaseRules, defaultBasePredictionRules } from '~/lib/leagues';
import updateBaseEventRules from '~/actions/updateBaseEventRules';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useQueryClient } from '@tanstack/react-query';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';

const formSchema = z.object({
  baseEventRules: BaseEventRulesZod,
  basePredictionRules: BasePredictionRulesZod
});

export default function LeagueScoring() {
  const queryClient = useQueryClient();
  const { data: league } = useLeague();
  const { data: leagueMembers } = useLeagueMembers();
  const { data: rules, refetch } = useLeagueRules();

  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      baseEventRules: rules?.base ?? defaultBaseRules,
      basePredictionRules: rules?.basePrediction ?? defaultBasePredictionRules
    },
    resolver: zodResolver(formSchema)
  });
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    reactForm.reset({
      baseEventRules: rules?.base ?? defaultBaseRules,
      basePredictionRules: rules?.basePrediction ?? defaultBasePredictionRules
    }, { keepDefaultValues: false });
  }, [rules?.base, rules?.basePrediction, reactForm]);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    if (!league) return;

    try {
      await updateBaseEventRules(league.hash, data.baseEventRules, data.basePredictionRules);
      await queryClient.invalidateQueries({ queryKey: ['rules', league.hash] });
      await refetch();
      setLocked(true);
      alert('Base event rules updated.');
    } catch (error) {
      console.error(error);
      alert('Failed to update official event rules');
    }
  });

  const disabled = (!!leagueMembers && leagueMembers.loggedIn?.role !== 'Owner') || league?.status === 'Inactive';

  return (
    <article className='p-2 bg-card rounded-xl w-full relative'>
      {!disabled && (locked ?
        <Lock
          className='absolute top-2 right-2 w-8 h-8 cursor-pointer stroke-primary hover:stroke-secondary transition-all'
          onClick={() => setLocked(false)} /> :
        <LockOpen
          className='absolute top-2 right-2 w-8 h-8 cursor-pointer stroke-primary hover:stroke-secondary transition-all'
          onClick={() => { setLocked(true); reactForm.reset(); }} />)}
      <h2 className='text-lg font-bold text-card-foreground'>Official Events</h2>
      <p className='text-sm mr-12 max-w-4xl'>
        These <i>Official Events</i> are <b>automatically scored</b> for your
        league based on what drafted castaways do in the show.
        <br />
        Set the point values for each event—these points will be awarded to the member
        whose current castaway pick scores the event.
        <br />
        Additionally, each event can be enabled as <b>predictions</b>.
        If enabled, members can predict the castaway that will hit this event and
        earn points if they&apos;re correct. Predictions can be made before each episode or at specific times throughout the season.
      </p>
      <div className='text-sm'>
        For example:
        <ul className='list-disc pl-4 max-w-4xl'>
          <li>If you set <i>Individual Immunity</i> to <b>5 points</b>, the member whose
            pick wins immunity earns those <b>5 points</b>.</li>
          <li>If you set <i>Tribe 1st Place</i> to <b>3 points</b>, then every member
            whose pick is on the winning tribe receives <b>3 points</b>.</li>
          <li>If you enable <i>Individual Immunity</i> as a prediction (weekly post-merge)
            for <b>3 points</b>, then once the individual game starts, each week members will pick the
            challenge winner. All who guess correctly earn <b>3 points</b>.</li>
        </ul>
      </div>
      <Form {...reactForm}>
        <form action={() => handleSubmit()}>
          <span className='grid lg:grid-cols-3 gap-x-4 gap-y-2'>
            <ChallengeScoreSettings disabled={disabled || locked} />
            <AdvantageScoreSettings disabled={disabled || locked}>
              {!(disabled || locked) && (
                <span className='w-fit ml-auto grid grid-cols-2 gap-2 mt-4'>
                  <Button
                    type='button'
                    variant='destructive'
                    onClick={() => { setLocked(true); reactForm.reset(); }}>
                    Cancel
                  </Button>
                  <Button
                    disabled={!reactForm.formState.isDirty || reactForm.formState.isSubmitting}
                    type='submit'>
                    Save
                  </Button>
                </span>)}
            </AdvantageScoreSettings>
            <OtherScoreSettings disabled={disabled || locked} />
          </span>
        </form>
      </Form>
    </article>
  );
}
