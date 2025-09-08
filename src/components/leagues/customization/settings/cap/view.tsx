'use client';

import { DEFAULT_SURVIVAL_CAP, MAX_SURVIVAL_CAP, SurvivalCapZod } from '~/types/deprecated/leagues';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { type z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '~/components/common/form';
import { Switch } from '~/components/common/switch';
import { Button } from '~/components/common/button';
import { updateLeagueSettings } from '~/services/deprecated/leagueActions';
import { useLeague } from '~/hooks/deprecated/useLeague';
import { Flame, Lock, LockOpen } from 'lucide-react';
import { useState } from 'react';
import { cn } from '~/lib/utils';
import SurvivalCapSlider from '~/components/leagues/customization/settings/cap/slider';


export default function SetSurvivalCap() {
  const { league, refresh } = useLeague();
  const reactForm = useForm<z.infer<typeof SurvivalCapZod>>({
    defaultValues: {
      survivalCap: league.settings.survivalCap ?? DEFAULT_SURVIVAL_CAP,
      preserveStreak: league.settings.preserveStreak ?? true
    },
    resolver: zodResolver(SurvivalCapZod)
  });
  const [locked, setLocked] = useState(true);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      await updateLeagueSettings(league.hash, data);
      alert('Survival cap updated successfully');
      setLocked(true);
      reactForm.reset(data);
      await refresh();
    } catch (error) {
      alert('Failed to update survival cap');
    }
  });

  return (
    <article className='p-2 bg-card rounded-xl w-full relative'>
      {league.members.loggedIn?.role === 'Owner' && (locked ?
        <Lock
          className='absolute top-2 right-2 w-8 h-8 cursor-pointer stroke-primary hover:stroke-secondary transition-all'
          onClick={() => setLocked(false)} /> :
        <LockOpen
          className='absolute top-2 right-2 w-8 h-8 cursor-pointer stroke-primary hover:stroke-secondary transition-all'
          onClick={() => { setLocked(true); reactForm.reset(); }} />)}
      <h2 className='text-lg font-bold text-card-foreground'>Survival Streak</h2>
      <p className='text-sm mr-12'>
        The <i>Survival Streak</i> rewards players for picking a castaway that survives each episode.
      </p>
      <div className='text-sm'>
        Each episode your pick survives, their streak grows:
        <ul className='list-disc pl-4'>
          <li><b>Episode 1</b>: Earn 1<Flame className='inline align-top w-4 h-4' /> point</li>
          <li><b>Episode 2</b>: Earn 2<Flame className='inline align-top w-4 h-4' /> points</li>
          <li><b>Episode 3</b>: Earn 3<Flame className='inline align-top w-4 h-4' /> points, and so on...</li>
        </ul>
        If your pick is eliminated, you must choose a new unclaimed castaway, and your streak resets.
      </div>
      <Form {...reactForm}>
        <form className='flex flex-wrap gap-x-12' action={() => handleSubmit()}>
          <FormField
            name='survivalCap'
            render={({ field: valueField }) => (
              <>
                <FormItem>
                  <FormLabel className='inline-flex gap-2 items-center'>Streak Cap
                    {locked && <>
                      <h2 className={cn('text-lg font-bold text-card-foreground',
                        valueField.value > 0 ? 'text-green-600' : 'text-destructive')}>
                        {valueField.value === 0
                          ? 'Off'
                          : valueField.value === MAX_SURVIVAL_CAP
                            ? 'Unlimited'
                            : valueField.value}
                      </h2>
                      {valueField.value > 0 && valueField.value < MAX_SURVIVAL_CAP &&
                        <Flame className={cn('inline align-top',
                          valueField.value <= 0 ? 'stroke-destructive' : 'stroke-green-600'
                        )} />}
                    </>}
                  </FormLabel>
                  <FormControl>
                    {!locked &&
                      <SurvivalCapSlider value={valueField.value as number} onChange={valueField.onChange} />}
                  </FormControl>
                  <FormDescription>
                    Set a cap on the maximum points a player can earn from their streak.
                    <br />
                    <b className='text-muted-foreground'>Note:</b> A cap
                    of <i className='text-muted-foreground'>0</i> will disable survival points
                    entirely, while an <i className='text-muted-foreground'>unlimited</i> cap will
                    heavily favor the player who drafts the winner.
                  </FormDescription>
                </FormItem>
                <span className='flex justify-between w-full items-end'>
                  <FormField
                    name='preserveStreak'
                    render={({ field: preserveField }) => (
                      <FormItem className={valueField.value === 0 ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}>
                        <FormLabel className='inline-flex gap-2 items-center'>Preserve Streak
                          {locked &&
                            <h2 className={cn('text-lg font-bold text-card-foreground',
                              preserveField.value ? 'text-green-600' : 'text-destructive')}>
                              {preserveField.value ? 'On' : 'Off'}
                            </h2>}
                        </FormLabel>
                        <FormControl>
                          {!locked &&
                            <Switch checked={preserveField.value as boolean} onCheckedChange={preserveField.onChange} />}
                        </FormControl>
                        <FormDescription>
                          Should streaks be <i className='text-muted-foreground'>preserved</i> if a
                          player switches their pick voluntarily, or reset to zero?
                        </FormDescription>
                      </FormItem>
                    )} />
                  {!locked &&
                    <span className='grid grid-cols-2 gap-2'>
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
                    </span>}
                </span>
              </>
            )} />
        </form>
      </Form>
    </article>
  );
}
