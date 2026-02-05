'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '~/components/common/form';
import { Switch } from '~/components/common/switch';
import { Button } from '~/components/common/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import { Lock, LockOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '~/lib/utils';
import { type SecondaryPickSettings as SecondaryPickSettingsType, SecondaryPickSettingsZod } from '~/types/leagues';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useLeagueRules } from '~/hooks/leagues/useLeagueRules';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { useQueryClient } from '@tanstack/react-query';
import updateSecondaryPickSettings from '~/actions/updateSecondaryPickSettings';
import { defaultSecondaryPickSettings, MAX_SEASON_LENGTH } from '~/lib/leagues';
import SeasonLengthSlider from '~/components/leagues/customization/settings/shared/slider';

export default function SecondaryPickSettings() {
  const queryClient = useQueryClient();
  const { data: league } = useLeague();
  const { data: rules } = useLeagueRules();
  const { data: leagueMembers } = useLeagueMembers();

  const [locked, setLocked] = useState(true);

  const reactForm = useForm<SecondaryPickSettingsType>({
    defaultValues: rules?.secondaryPick ?? defaultSecondaryPickSettings,
    resolver: zodResolver(SecondaryPickSettingsZod),
  });

  useEffect(() => {
    if (rules?.secondaryPick) {
      console.log({ ...defaultSecondaryPickSettings, ...rules.secondaryPick },
        { ...rules.secondaryPick }, { ...defaultSecondaryPickSettings });
      reactForm.reset({
        ...defaultSecondaryPickSettings,
        ...rules.secondaryPick,
      });
    }
  }, [rules?.secondaryPick, reactForm]);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    if (!league) return;

    try {
      await updateSecondaryPickSettings(league.hash, data);
      await queryClient.invalidateQueries({ queryKey: ['rules', league.hash] });
      await queryClient.invalidateQueries({ queryKey: ['league', league.hash] });
      setLocked(true);
      alert('Secondary Pick settings saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to save Secondary Pick settings.');
    }
  });

  const disabled = (!!leagueMembers && leagueMembers.loggedIn?.role !== 'Owner') || league?.status === 'Inactive';

  return (
    <article className='p-3 bg-card rounded-lg w-full border-2 border-primary/20 shadow-lg shadow-primary/10 relative'>
      {!disabled && (locked ?
        <Lock
          className='absolute top-3 right-3 w-8 h-8 shrink-0 cursor-pointer stroke-primary hover:stroke-primary/70 active:stroke-primary/50 transition-all'
          onClick={() => setLocked(false)} /> :
        <LockOpen
          className='absolute top-3 right-3 w-8 h-8 shrink-0 cursor-pointer stroke-primary hover:stroke-primary/70 active:stroke-primary/50 transition-all'
          onClick={() => { setLocked(true); reactForm.reset(); }} />)}

      <div className='flex items-center gap-3 h-8'>
        <span className='h-4 md:h-6 w-1 bg-primary rounded-full' />
        <h2 className='md:text-xl font-black uppercase tracking-tight leading-none text-nowrap'>
          Secondary Pick
        </h2>
      </div>

      <p className='text-sm mr-12 max-w-4xl'>
        The <i>Secondary Pick</i> allows members to choose an additional castaway between episodes to earn bonus points.
        Unlike the main draft, multiple members can select the same secondary for a given episode.
        <br />
        <span className='text-xs text-muted-foreground'>
          <b className='text-inherit'>Note:</b> Your secondary
          pick <b className='text-inherit'>does not</b> earn you survival points for staying in the game
          <br /> and you <b className='text-inherit'>can</b> still make a secondary pick even if
          your main survivor has been eliminated.
        </span>
      </p>
      <br />

      <Form {...reactForm}>
        <form onSubmit={handleSubmit}>
          <span className='flex items-end justify-between'>
            <FormField
              name='enabled'
              render={({ field }) => (
                <FormItem className='flex items-center gap-2'>
                  <FormLabel className='text-sm'>Secondary Pick</FormLabel>
                  <FormControl>
                    {locked ? (
                      <h2 className={cn('font-semibold', field.value ? 'text-green-600' : 'text-destructive')}>
                        {field.value ? 'On' : 'Off'}
                      </h2>
                    ) : (
                      <Switch
                        checked={field.value as boolean}
                        onCheckedChange={(checked) => field.onChange(checked)} />
                    )}
                  </FormControl>
                </FormItem>
              )} />

            {!(disabled || locked) && (
              <span className='w-fit ml-auto grid grid-cols-2 gap-2 mt-4'>
                <Button
                  type='button'
                  variant='destructive'
                  onClick={() => { reactForm.reset(); setLocked(true); }}>
                  Cancel
                </Button>
                <Button
                  disabled={!reactForm.formState.isDirty || reactForm.formState.isSubmitting}
                  type='submit'>
                  Save
                </Button>
              </span>
            )}
          </span>

          {reactForm.watch('enabled') && (
            <>
              <hr className='my-1 stroke-primary' />
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2 max-w-4xl animate-scale-in-fast'>

                {/* Can Pick Own Survivor */}
                <div>
                  <FormField
                    name='canPickOwnSurvivor'
                    render={({ field }) => (
                      <FormItem className='flex items-center gap-2'>
                        <FormLabel className='text-sm'>Allow Own Survivor</FormLabel>
                        <FormControl>
                          {locked ? (
                            <h2 className={cn('font-semibold', field.value ? 'text-green-600' : 'text-destructive')}>
                              {field.value ? 'Yes' : 'No'}
                            </h2>
                          ) : (
                            <Switch
                              checked={field.value as boolean}
                              onCheckedChange={(checked) => field.onChange(checked)} />
                          )}
                        </FormControl>
                      </FormItem>
                    )} />
                  <FormDescription>
                    Can members select their current survivor as their secondary pick?
                  </FormDescription>
                </div>

                {/* Lockout Period */}
                <div>
                  <FormField
                    name='lockoutPeriod'
                    render={({ field }) => {
                      if (locked) {
                        return (
                          <span className='text-muted-foreground text-sm w-full'>
                            <h4 className='font-medium inline mr-1'>Lockout Period:</h4>
                            {field.value === MAX_SEASON_LENGTH
                              ? 'Never repeat'
                              : `${field.value} episodes`}
                          </span>
                        );
                      }

                      return (
                        <FormItem>
                          <FormLabel className='text-sm ml-4'>Lockout Period</FormLabel>
                          <FormControl>
                            <SeasonLengthSlider
                              value={field.value as number}
                              onChange={field.onChange}
                              maxLabel='Never repeat' />
                          </FormControl>
                        </FormItem>
                      );
                    }} />
                  <FormDescription>
                    Episodes before a castaway can be selected again as a secondary pick.
                    For an extra challenge, max this out and never allow repeats!
                  </FormDescription>
                </div>

                {/* Public Picks */}
                <div>
                  <FormField
                    name='publicPicks'
                    render={({ field }) => (
                      <FormItem className='flex items-center gap-2'>
                        <FormLabel className='text-sm'>Public Picks</FormLabel>
                        <FormControl>
                          {locked ? (
                            <h2 className={cn('font-semibold', field.value ? 'text-green-600' : 'text-destructive')}>
                              {field.value ? 'Yes' : 'No'}
                            </h2>
                          ) : (
                            <Switch
                              checked={field.value as boolean}
                              onCheckedChange={(checked) => field.onChange(checked)} />
                          )}
                        </FormControl>
                      </FormItem>
                    )} />
                  <FormDescription>
                    Should members see other members&apos; secondary picks before the episode airs?
                  </FormDescription>
                </div>

                {/* Multiplier */}
                <div>
                  <FormField
                    name='multiplier'
                    render={({ field }) => {
                      if (locked) {
                        return (
                          <span className='text-muted-foreground text-sm w-full'>
                            <h4 className='font-medium inline mr-1'>Points Multiplier:</h4>
                            {field.value === 1 ? 'Full' : `${field.value * 100}%`}
                          </span>
                        );
                      }

                      return (
                        <FormItem>
                          <FormLabel className='text-sm ml-4'>Points Multiplier</FormLabel>
                          <FormControl>
                            <Select
                              value={String(field.value)}
                              onValueChange={(val) => field.onChange(Number(val))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='0.5'>1/2 (50%)</SelectItem>
                                <SelectItem value='1'>Full (100%)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      );
                    }} />
                  <FormDescription>
                    Percentage of points earned by secondary pick castaway.
                  </FormDescription>
                </div>
              </div>
            </>
          )}
        </form>
      </Form>
    </article>
  );
}
