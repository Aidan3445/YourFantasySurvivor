'use client';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { Input } from '~/components/common/input';
import { Textarea } from '~/components/common/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import { MultiSelect } from '~/components/common/multiSelect';
import { type ReactNode } from 'react';
import PredictionTimingHelp from '~/components/leagues/actions/events/predictions/timingHelp';
import { EventTypes, PredictionTimings, ReferenceTypes } from '~/lib/events';
import { cn } from '~/lib/utils';

interface LeagueEventFieldsProps {
  isPrediction: boolean;
  children?: ReactNode;
}

export default function LeagueEventFields({ isPrediction, children }: LeagueEventFieldsProps) {

  return (
    <>
      <FormField
        name='eventName'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>Event Name</FormLabel>
            <FormControl>
              <Input
                type='text'
                placeholder='Enter the name of the event'
                {...field} />
            </FormControl>
            <FormDescription className='sr-only'>
              The name of the event that will be scored in this league.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='description'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>Description</FormLabel>
            <FormControl>
              <Textarea
                className='w-full border-2 border-primary/20 focus:border-primary/40 bg-accent max-h-20 font-medium'
                placeholder='Points awarded to...'
                {...field} />
            </FormControl>
            <FormDescription className='sr-only'>
              A description of the event that will be scored in this league.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='referenceTypes'
        render={({ field }) => (
          <FormItem className='w-full'>
            <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>Reference Type</FormLabel>
            <FormControl>
              <MultiSelect
                options={ReferenceTypes
                  .map((option) => ({ label: option, value: option }))}
                onValueChange={field.onChange}
                defaultValue={field.value as string[]}
                value={field.value as string[]}
                modalPopover
                placeholder='Select reference types' />
            </FormControl>
            <FormDescription className='sr-only'>
              Does this event reference a castaway or tribe or either?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />
      <span className='flex gap-4 items-center w-full'>
        <FormField
          name='points'
          render={({ field }) => (
            <FormItem className='w-1/3'>
              <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>Points</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step={1}
                  min={isPrediction ? 0 : undefined}
                  placeholder='Points'
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    console.log('Parsed value:', value, isPrediction);
                    if (isNaN(value)) {
                      field.onChange('');
                    } else if (isPrediction && value <= 0) {
                      field.onChange(-1 * value);
                    } else {
                      field.onChange(value);
                    }
                  }} />
              </FormControl>
              <FormDescription className='sr-only'>
                Points awarded for this event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        <FormField
          name='eventType'
          render={({ field }) => (
            <FormItem className='w-2/3'>
              <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>Event Type</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value as string}
                  value={field.value as string}
                  onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select event type' />
                  </SelectTrigger>
                  <SelectContent>
                    {EventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription className='sr-only'>
                How this event will be scored.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
      </span>
      <span className='flex gap-4 items-center w-full'>
        <FormField
          name='timing'
          render={({ field }) => (
            <FormItem className={'w-full'}>
              <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-0.5'>
                Timing
                <PredictionTimingHelp />
              </FormLabel>
              <FormControl>
                <MultiSelect
                  className={cn(!isPrediction && 'pointer-events-none')}
                  options={
                    PredictionTimings
                      .map((option) => ({ label: option, value: option }))
                  }
                  onValueChange={field.onChange}
                  defaultValue={field.value as string[]}
                  value={field.value as string[]}
                  disabled={!isPrediction}
                  empty={!isPrediction}
                  modalPopover
                  placeholder='Select prediction timing' />
              </FormControl>
              <FormDescription className='sr-only'>
                When this event will be scored.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        {children}
      </span>
    </>
  );
}
