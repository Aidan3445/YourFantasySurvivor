'use client';

import { useForm } from 'react-hook-form';
import ColorRow from '~/components/shared/colorRow';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { type ScoringBaseEventName } from '~/types/events';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '~/components/common/button';
import { Switch } from '~/components/common/switch';
import { Input } from '~/components/common/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import { useEffect, useState } from 'react';
import { MultiSelect } from '~/components/common/multiSelect';
import { Lock, LockOpen } from 'lucide-react';
import { cn } from '~/lib/utils';
import { type ShauhinModeSettings, ShauhinModeSettingsZod } from '~/types/leagues';
import { ABS_MAX_EVENT_POINTS, defaultShauhinModeSettings, SHAUHIN_MODE_MAX_MAX_BETS_PER_WEEK, ShauhinModeTimings } from '~/lib/leagues';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useQueryClient } from '@tanstack/react-query';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import updateShauhinMode from '~/actions/updateShauhinMode';
import { BaseEventFullName } from '~/lib/events';

export default function ShauhinMode() {
  const queryClient = useQueryClient();
  const { data: league } = useLeague();
  const { data: rules } = useLeagueRules();
  const { data: leagueMembers } = useLeagueMembers();

  const reactForm = useForm<ShauhinModeSettings>({
    defaultValues: rules?.shauhinMode ?? defaultShauhinModeSettings,
    resolver: zodResolver(ShauhinModeSettingsZod),
  });
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    const defaults = defaultShauhinModeSettings;

    if (rules && !rules.shauhinMode) {
      // ensure that default shauhin mode settings are valid with current rules
      defaults.enabledBets = defaults.enabledBets.filter((bet) =>
        rules.basePrediction?.[bet]?.enabled);
    }

    const settings = rules?.shauhinMode ?? defaultShauhinModeSettings;
    //settings.enabledBets = settings.enabledBets.filter((bet) =>
    //basePredictionRules[bet as ScoringBaseEventName]?.enabled);

    reactForm.reset(settings);
  }, [rules?.shauhinMode, reactForm, rules]);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    if (!league) return;

    try {
      ShauhinModeSettingsZod.parse(data); // Validate data before sending

      await updateShauhinMode(league.hash, data);
      await queryClient.invalidateQueries({ queryKey: ['rules', league.hash] });
      setLocked(true);
      alert('Shauhin Mode settings saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to save Shauhin Mode settings.');
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
      <h2 className='text-lg font-semibold'>
        Shauhin Mode
      </h2>
      <p className='text-sm mr-12 max-w-4xl'>
        Inspired by a <a
          className='text-primary underline hover:text-secondary transition-colors'
          href='https://www.tiktok.com/t/ZT62XJL2V/'
          target='_blank'
          rel='noopener noreferrer'>
          video
        </a> that
        <ColorRow color='#d05dbd' className='inline w-min px-0.5 ml-1 text-white!'>
          Shauhin Davari
        </ColorRow>,
        from Survivor 48, posted, this twist allows you to bet points {'you\'ve'} earned
        throughout the season on predictions.If you win, you gain those points in addition to
        the base points for the event.If you miss the prediction, you get nothing.
      </p >
      <br />
      <Form {...reactForm}>
        <form onSubmit={handleSubmit}>
          <FormField
            name='enabled'
            render={({ field }) => (
              <FormItem className='flex items-center gap-2'>
                <FormLabel className='text-sm'>Shauhin Mode</FormLabel>
                <FormControl>
                  {locked ? (
                    <h2 className={cn('font-semibold', field.value ? 'text-green-600' : 'text-destructive')}>
                      {field.value ? 'On' : 'Off'}
                    </h2>
                  ) : (
                    <Switch
                      checked={field.value as boolean}
                      onCheckedChange={(checked) => field.onChange(checked)}
                      className='' />
                  )}
                </FormControl>
              </FormItem>
            )} />
          {reactForm.watch('enabled') && (
            <>
              <hr className='my-1 stroke-primary' />
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2 max-w-4xl animate-scale-in-fast'>
                <div>
                  <FormField
                    name='startWeek'
                    render={({ field }) => {
                      if (locked) {
                        return (
                          <span className='text-muted-foreground text-sm w-full'>
                            <h4 className='font-medium inline mr-1'>Start Timing:</h4>
                            {field.value === 'Custom'
                              ? `Custom (after ${reactForm.watch('customStartWeek')} episodes)`
                              : field.value}
                          </span>
                        );
                      }

                      return (
                        <FormItem>
                          <FormLabel className='text-sm ml-4'>Start Timing</FormLabel>
                          <FormControl>
                            <span className='flex items-center gap-2'>
                              <Select value={field.value as string} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder='Select Betting Start Week' />
                                </SelectTrigger>
                                <SelectContent>
                                  {ShauhinModeTimings.map((timing) => (
                                    <SelectItem key={timing} value={timing}>
                                      {timing}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {field.value === 'Custom' && (
                                <FormField
                                  name='customStartWeek'
                                  render={({ field: customField }) => (
                                    <FormItem className='w-full'>
                                      <FormControl>
                                        <Input
                                          type='number'
                                          min={2}
                                          placeholder='Enable after episode...'
                                          {...customField}
                                          onChange={(e) => customField.onChange(+e.target.value)}
                                          onFocus={(e) => e.target.select()}
                                          value={Math.max(2, customField.value as number || 2)} />
                                      </FormControl>
                                      {customField.value > 14 && (
                                        <p className='text-xs text-destructive mt-1'>
                                          Warning: Most seasons do not have this many weeks!
                                        </p>
                                      )}
                                    </FormItem>
                                  )} />
                              )}
                            </span>
                          </FormControl >
                          <FormMessage />
                        </FormItem >
                      );
                    }} />
                  <FormDescription>
                    Choose when Shauhin Mode activates.You can choose from predefined timings or
                    set a custom week for betting to start.
                  </FormDescription >
                </div >
                <div>
                  <span className='flex w-full items-center gap-2'>
                    <FormField
                      name='maxBet'
                      render={({ field }) => {
                        if (locked) {
                          return (
                            <span className='text-muted-foreground text-sm w-full'>
                              <h4 className='font-medium inline mr-1'>Max Points Per Bet:</h4>
                              {field.value}
                            </span>
                          );
                        }

                        return (
                          <FormItem className='w-full relative'>
                            <FormLabel className='text-sm ml-4'>Max Points Per Bet</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                placeholder='Max Bet'
                                className='input'
                                min={0}
                                max={ABS_MAX_EVENT_POINTS}
                                {...field}
                                onChange={(e) => field.onChange(+e.target.value)}
                                onFocus={(e) => e.target.select()}
                              />
                            </FormControl>
                            <p className='absolute text-xs right-8 top-1/2 translate-y-1 text-muted-foreground pointer-events-none'>
                              (0 for Unlimited)
                            </p>
                          </FormItem>
                        );
                      }} />
                    <FormField
                      name='maxBetsPerWeek'
                      render={({ field }) => {
                        if (locked) {
                          return (
                            <span className='text-muted-foreground text-sm w-full'>
                              <h4 className='font-medium inline mr-1'>Max Bets Per Week:</h4>
                              {field.value === 0 ? 'Unlimited' : field.value}
                            </span>
                          );
                        }

                        return (
                          <FormItem className='w-full relative'>
                            <FormLabel className='text-sm ml-4'>Max Bets Per Week</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                placeholder='Max Bets Per Week'
                                className='input'
                                min={0}
                                max={SHAUHIN_MODE_MAX_MAX_BETS_PER_WEEK}
                                {...field}
                                onChange={(e) => field.onChange(+e.target.value)}
                                onFocus={(e) => e.target.select()}
                              />
                            </FormControl>
                            <p className='absolute text-xs right-8 top-1/2 translate-y-1 text-muted-foreground pointer-events-none'>
                              (0 for Unlimited)
                            </p>
                          </FormItem>
                        );
                      }} />
                  </span>
                  <FormDescription>
                    <i className='text-muted-foreground'>Max Points Per Bet</i>: max points you can bet on a prediction<br />
                    <i className='text-muted-foreground'>Max Bets Per Week</i>: max number of bets you can place in a single week<br />
                  </FormDescription>
                </div>
                <div>
                  <FormField
                    name='enabledBets'
                    render={({ field }) => {
                      const values = field.value as ScoringBaseEventName[] | undefined;
                      if (locked) {
                        return (
                          <span className='text-muted-foreground text-sm/3 w-full'>
                            <h4 className='font-medium inline mr-1'>Enabled Bets:</h4>
                            {values && values.length > 0
                              ? values.map((name: ScoringBaseEventName) => BaseEventFullName[name]).join(', ')
                              : 'None'
                            }
                          </span >
                        );
                      }

                      return (
                        <FormItem>
                          <FormLabel className='text-sm ml-4'>Enabled Bets</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={Object.entries(rules?.basePrediction ?? {})
                                .filter(([_, setting]) => setting.enabled)
                                .map(([eventName]) => ({
                                  value: eventName as ScoringBaseEventName,
                                  label: BaseEventFullName[eventName as ScoringBaseEventName],
                                }))}
                              onValueChange={field.onChange}
                              defaultValue={field.value as string[]}
                              placeholder='Select enabled bets'
                              maxCount={1}
                              className='w-full'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }} />
                  <FormDescription>
                    Select what you can bet on from your enabled official and custom prediction events.
                  </FormDescription >
                </div >
                <FormField
                  name='noEventIsMiss'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={cn('text-sm text-nowrap', locked ? '-ml-1' : 'ml-4')}>
                        {'\'No Event\''} is <div
                          className={cn('inline', field.value ? 'text-destructive' : 'text-green-600')} >
                          {field.value ? 'Missed' : 'Refunded'}
                        </div ></FormLabel >
                      <span className='flex items-center gap-2'>
                        {!locked && (
                          <FormControl>
                            <Switch
                              checked={field.value as boolean}
                              onCheckedChange={(checked) => field.onChange(checked)}
                              className='' />
                          </FormControl>
                        )}
                        <FormDescription>
                          <i className='text-muted-foreground'>Missed</i>: bets on events
                          that do not occur will not be considered a missed prediction<br />
                          <i className='text-muted-foreground'>Refunded</i>:
                          if an event does not occur, you get your bet back
                        </FormDescription>
                      </span>
                    </FormItem >
                  )
                  } />
              </div >
            </>
          )}
          {
            !(disabled || locked) && (
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
              </span>)
          }
        </form >
      </Form >
    </article >
  );
}
