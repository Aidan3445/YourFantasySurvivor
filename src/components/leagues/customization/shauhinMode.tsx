'use client';

import { useForm } from "react-hook-form";
import { ColorRow } from "../draftOrder";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { BaseEventFullName, PredictionTimingOptions, ScoringBaseEventNames, ShauhinModeTimings } from "~/server/db/defs/events";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useState } from "react";
import { MultiSelect } from "~/components/ui/multiSelect";
import { Lock, LockOpen } from "lucide-react";
import { useLeague } from "~/hooks/useLeague";
import { cn } from "~/lib/utils";


const formSchema = z.object({
  enabled: z.boolean(),
  maxBet: z.number().min(0).max(1000),
  maxBetsPerWeek: z.number().min(0),
  startWeek: z.union([z.number().min(0).max(15), z.enum(ShauhinModeTimings)]),
  enabledBets: z.array(z.enum(ScoringBaseEventNames)),
  noEventIsMiss: z.boolean().default(false),
});

export default function ShauhinMode() {
  const {
    league: {
      members: {
        loggedIn
      }
    },
  } = useLeague();

  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      enabled: true,
      maxBet: 100,
      maxBetsPerWeek: 5,
      startWeek: 'After Merge',
      enabledBets: [
        'indivWin',
        'finalists',
        'fireWin',
        'soleSurvivor'
      ],
      noEventIsMiss: false
    },
    resolver: zodResolver(formSchema)
  });
  const [locked, setLocked] = useState(true);
  const [customStartWeeks, setCustomStartWeeks] = useState<number>(8);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    alert('Shauhin Mode settings saved successfully!');
    console.log('Shauhin Mode settings:', data);
  });

  const disabled = loggedIn?.role !== 'Owner';

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
        <ColorRow color='#d05dbd' className='inline w-min px-0.5 ml-1 !text-white'>
          Shauhin Davari
        </ColorRow>,
        from Survivor 48, posted, this twist allows you to bet points you've earned
        throughout the season on predictions. If you win, you gain those points in addition to
        the base points for the event. If you miss the prediction, you get nothing.
      </p>
      <br />
      <Form {...reactForm}>
        <form action={() => handleSubmit()}>
          <FormField
            name='enabled'
            render={({ field }) => (
              <FormItem className='flex items-center gap-2'>
                <FormLabel className='text-sm'>Enable Shauhin Mode:</FormLabel>
                <FormControl>
                  {locked ? (
                    <h2 className={cn('font-semibold', field.value ? 'text-green-600' : 'text-destructive')}>
                      {field.value ? 'On' : 'Off'}
                    </h2>
                  ) : (
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                      className='' />
                  )}
                </FormControl>
              </FormItem>
            )} />
          {reactForm.watch('enabled') && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2 max-w-4xl animate-scale-in-fast'>
              <FormField
                name='startWeek'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm ml-4'>Start Timing</FormLabel>
                    <FormControl>
                      <span className='flex items-center gap-2'>
                        <Select value={field.value} onValueChange={field.onChange}>
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
                          <Input
                            type='number'
                            min={0}
                            max={12}
                            placeholder='Enable after episode...'
                            value={customStartWeeks}
                            onChange={(e) => setCustomStartWeeks(Number(e.target.value))} />
                        )}
                      </span>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <span className='flex w-full items-center gap-2'>
                <FormField
                  name='maxBet'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='text-sm ml-4'>Max Points Per Bet</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='Max Bet'
                          className='input'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <FormField
                  name='maxBetsPerWeek'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='text-sm ml-4'>Max Bets Per Week</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='Max Bets Per Week'
                          className='input'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
              </span>
              <FormField
                name='enabledBets'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm ml-4'>Enabled Bets</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={ScoringBaseEventNames.map(name =>
                          ({ value: name, label: BaseEventFullName[name] }))}
                        onValueChange={field.onChange}
                        defaultValue={field.value as string[]}
                        placeholder='Select enabled bets'
                        maxCount={1}
                        className='w-full'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <FormField
                name='noEventIsMiss'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm text-nowrap ml-4'>
                      No Event is <div className='text-destructive inline'>Miss</div></FormLabel>
                    <span className='flex items-center gap-2'>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked)}
                          className='' />
                      </FormControl>
                      <FormDescription>
                        If enabled, bets on events that do not occur will not be considered a missed
                        prediction. By default, if an event does not occur, you get your bet back.
                      </FormDescription>
                    </span>
                  </FormItem>
                )} />
            </div>
          )}
          {!(disabled || locked) && (
            <span className='w-fit ml-auto grid grid-cols-2 gap-2 mt-4'>
              <Button
                type='button'
                variant='destructive'
                onClick={() => { reactForm.reset(); }}>
                Cancel
              </Button>
              <Button
                disabled={!reactForm.formState.isDirty}
                type='submit'>
                Save
              </Button>
            </span>)}
        </form>
      </Form>
    </article>
  );
}
