'use client';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { LeagueEventTypeOptions, PredictionTimingOptions, ReferenceOptions } from '~/types/events';
import { Input } from '~/components/common/input';
import { Textarea } from '~/components/common/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import { MultiSelect } from '~/components/common/multiSelect';
import { type ReactNode, useState } from 'react';
import PredictionTimingHelp from '~/components/leagues/actions/events/predictions/timingHelp';

interface LeagueEventFieldsProps {
  predictionDefault?: boolean;
  children?: ReactNode;
}

export default function LeagueEventFields({ predictionDefault, children }: LeagueEventFieldsProps) {
  const [isPrediction, setIsPrediction] = useState(predictionDefault ?? false);

  const onTypeChange = (type: string) => {
    setIsPrediction(type === 'Prediction');
    return type;
  };

  return (
    <>
      <FormField
        name='eventName'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Name</FormLabel>
            <FormControl>
              <Input
                className='w-full text-black'
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
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                className='w-full text-black max-h-20'
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
            <FormLabel>Reference Type</FormLabel>
            <FormControl>
              <MultiSelect
                options={ReferenceOptions
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
              <FormLabel>Points</FormLabel>
              <FormControl>
                <Input
                  className='w-full text-black'
                  type='number'
                  step={1}
                  placeholder='Points'
                  {...field} />
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
              <FormLabel>Event Type</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value as string}
                  value={field.value as string}
                  onValueChange={(value) => { onTypeChange(value); field.onChange(value); }} >
                  <SelectTrigger>
                    <SelectValue placeholder='Select event type' />
                  </SelectTrigger>
                  <SelectContent>
                    {LeagueEventTypeOptions.map((type) => (
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
            <FormItem className={!isPrediction ? 'pointer-events-none! w-full' : 'w-full'}>
              <FormLabel className='flex items-center gap-1'>
                Timing
                <PredictionTimingHelp />
              </FormLabel>
              <FormControl>
                <MultiSelect
                  options={PredictionTimingOptions
                    .map((option) => ({ label: option, value: option }))}
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
