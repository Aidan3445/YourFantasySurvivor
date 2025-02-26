'use client';

import { z } from 'zod';
import { BaseEventRuleZod, defaultBaseRules } from '~/server/db/defs/events';
import { useForm } from 'react-hook-form';
import { useLeague } from '~/hooks/useLeague';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '~/components/ui/form';
import { Button } from '~/components/ui/button';
import { updateBaseEventRules } from '~/app/api/leagues/actions';
import { useEffect, useState } from 'react';
import { Lock, LockOpen } from 'lucide-react';
import { AdvantageScoreSettings, ChallengeScoreSettings, OtherScoreSettings } from './customization/baseEvents';

const formSchema = z.object({
  baseEventRules: BaseEventRuleZod
});

export default function LeagueScoring() {
  const {
    league: {
      leagueHash,
      baseEventRules,
      leagueStatus,
      members: {
        loggedIn
      },
      settings: {
        draftDate
      }
    },
    refresh,
  } = useLeague();
  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: { baseEventRules: baseEventRules ?? defaultBaseRules },
    resolver: zodResolver(formSchema)
  });
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    reactForm.setValue('baseEventRules', baseEventRules ?? defaultBaseRules);
  }, [baseEventRules, reactForm]);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      await updateBaseEventRules(leagueHash, data.baseEventRules);
      await refresh();
      alert(`Base event rules updated for league ${leagueHash}`);
    } catch (error) {
      console.error(error);
      alert('Failed to update official event rules');
    }
  });

  const disabled =
    leagueStatus !== 'Predraft' ||
    loggedIn?.role !== 'Owner' ||
    (!!draftDate && Date.now() > draftDate.getTime());

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
      <p className='text-sm'>
        These <i>Official Events</i> are <b>automatically scored</b> for your
        league based on what drafted castaways do in the show.
        <br />
        Set the point values for each event—these points will be awarded to the member
        whose current castaway pick scores the event.
      </p>
      <div className='text-sm'>
        For example:
        <ul className='list-disc pl-4'>
          <li>If you set <i>Individual Immunity</i> to <b>5 points</b>, the member whose
            pick wins immunity earns those <b>5 points</b>.</li>
          <li>If you set <i>Tribe 1st Place</i> to <b>3 points</b>, then every member
            whose pick is on the winning tribe receives <b>3 points</b>.</li>
        </ul>
      </div>
      <Form {...reactForm}>
        <form action={() => handleSubmit()}>
          <span className='grid lg:grid-cols-3 gap-4 '>
            <ChallengeScoreSettings disabled={disabled || locked} />
            <AdvantageScoreSettings disabled={disabled || locked} />
            <OtherScoreSettings disabled={disabled || locked} />
          </span>
          {!(disabled || locked) && (
            <span className='w-fit ml-auto grid grid-cols-2 gap-2'>
              <Button
                type='button'
                variant='destructive'
                onClick={() => { setLocked(true); reactForm.reset(); }}>
                Cancel
              </Button>
              <Button type='submit'>Save</Button>
            </span>)}
        </form>
      </Form>
    </article >
  );
}
