import { Flame } from 'lucide-react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { Input } from '~/components/common/input';
import { cn } from '~/lib/utils';
import { BaseEventDescriptions, BaseEventFullName } from '~/types/events';
import { BaseEventSettingsProps, BasePredictionFormField } from './predictions';

export default function AdvantageScoreSettings({ disabled }: BaseEventSettingsProps) {
    return (
      <div>
        <FormLabel className='text-2xl'>Advantages</FormLabel>
        <FormField
          name='baseEventRules.advFound'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='inline-flex gap-2 items-center'>
                {BaseEventFullName.advFound}
                {disabled &&
                  <h2 className={cn(
                    'text-lg font-bold text-card-foreground',
                    field.value <= 0 ? 'text-destructive' : 'text-green-600')}>
                    {field.value}
                    <Flame className={cn('inline align-top',
                      field.value <= 0 ? 'stroke-destructive' : 'stroke-green-600'
                    )} />
                  </h2>}
              </FormLabel>
              <span className='flex gap-4 items-top'>
                {!disabled &&
                  <FormControl>
                    <Input
                      className='w-24 text-black'
                      type='number'
                      step={1}
                      placeholder='Points'
                      disabled={disabled}
                      {...field} />
                  </FormControl>}
                <FormDescription className='max-w-72 text-wrap'>
                  {BaseEventDescriptions.main.advFound}
                </FormDescription>
              </span>
              <BasePredictionFormField eventName={'advFound'} disabled={disabled} />
              <FormMessage />
            </FormItem>
          )} />
        <FormField
          name='baseEventRules.advPlay'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='inline-flex gap-2 items-center'>
                {BaseEventFullName.advPlay}
                {disabled &&
                  <h2 className={cn(
                    'text-lg font-bold text-card-foreground',
                    field.value <= 0 ? 'text-destructive' : 'text-green-600')}>
                    {field.value}
                    <Flame className={cn('inline align-top',
                      field.value <= 0 ? 'stroke-destructive' : 'stroke-green-600'
                    )} />
                  </h2>}
              </FormLabel>
              <span className='flex gap-4 items-top'>
                {!disabled &&
                  <FormControl>
                    <Input
                      className='w-24 text-black'
                      type='number'
                      step={1}
                      placeholder='Points'
                      disabled={disabled}
                      {...field} />
                  </FormControl>}
                <FormDescription className='max-w-72 text-wrap'>
                  {BaseEventDescriptions.main.advPlay}
                </FormDescription>
              </span>
              <BasePredictionFormField eventName={'advPlay'} disabled={disabled} />
              <FormMessage />
            </FormItem>
          )} />
        <FormField
          name='baseEventRules.badAdvPlay'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='inline-flex gap-2 items-center'>
                {BaseEventFullName.badAdvPlay}
                {disabled &&
                  <h2 className={cn(
                    'text-lg font-bold text-card-foreground',
                    field.value <= 0 ? 'text-destructive' : 'text-green-600')}>
                    {field.value}
                    <Flame className={cn('inline align-top',
                      field.value <= 0 ? 'stroke-destructive' : 'stroke-green-600'
                    )} />
                  </h2>}
              </FormLabel>
              <span className='flex gap-4 items-top'>
                {!disabled &&
                  <FormControl>
                    <Input
                      className='w-24 text-black'
                      type='number'
                      step={1}
                      placeholder='Points'
                      disabled={disabled}
                      {...field} />
                  </FormControl>}
                <FormDescription className='max-w-72 text-wrap'>
                  {BaseEventDescriptions.main.badAdvPlay} <i className='text-xs text-muted-foreground'>
                    {BaseEventDescriptions.italics.badAdvPlay}</i>
                </FormDescription>
              </span>
              <BasePredictionFormField eventName={'badAdvPlay'} disabled={disabled} />
              <FormMessage />
            </FormItem>
          )} />
        <FormField
          name='baseEventRules.advElim'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='inline-flex gap-2 items-center'>
                {BaseEventFullName.advElim}
                {disabled &&
                  <h2 className={cn(
                    'text-lg font-bold text-card-foreground',
                    field.value <= 0 ? 'text-destructive' : 'text-green-600')}>
                    {field.value}
                    <Flame className={cn('inline align-top',
                      field.value <= 0 ? 'stroke-destructive' : 'stroke-green-600'
                    )} />
                  </h2>}
              </FormLabel>
              <span className='flex gap-4 items-top'>
                {!disabled &&
                  <FormControl>
                    <Input
                      className='w-24 text-black'
                      type='number'
                      step={1}
                      placeholder='Points'
                      disabled={disabled}
                      {...field} />
                  </FormControl>}
                <FormDescription className='max-w-72 text-wrap'>
                  {BaseEventDescriptions.main.advElim} <i className='text-xs text-muted-foreground'>
                    {BaseEventDescriptions.italics.advElim}</i>
                </FormDescription>
              </span>
              <BasePredictionFormField eventName={'advElim'} disabled={disabled} />
              <FormMessage />
            </FormItem>
          )
          } />
      </div >
    );
  }
  