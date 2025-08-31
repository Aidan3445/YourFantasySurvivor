import { Flame } from 'lucide-react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { Input } from '~/components/common/input';
import { cn } from '~/lib/utils';
import { BaseEventDescriptions, BaseEventFullName } from '~/types/events';
import { BaseEventSettingsProps, BasePredictionFormField } from './predictions';

export default function OtherScoreSettings({ disabled }: BaseEventSettingsProps) {
  return (
    <div>
      <FormLabel className='text-2xl'>Other</FormLabel>
      <div>
        <FormField
          name='baseEventRules.spokeEpTitle'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='inline-flex gap-2 items-center'>
                {BaseEventFullName.spokeEpTitle}
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
                  {BaseEventDescriptions.main.spokeEpTitle}
                </FormDescription>
              </span>
              <BasePredictionFormField eventName={'spokeEpTitle'} disabled={disabled} />
              <FormMessage />
            </FormItem>
          )} />
      </div>
      <div>
        <FormField
          name='baseEventRules.finalists'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='inline-flex gap-2 items-center'>
                {BaseEventFullName.finalists}
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
                  {BaseEventDescriptions.main.finalists}
                </FormDescription>
              </span>
              <BasePredictionFormField eventName={'finalists'} disabled={disabled} />
              <FormMessage />
            </FormItem>
          )} />
      </div>
      <div>
        <FormField
          name='baseEventRules.fireWin'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='inline-flex gap-2 items-center'>
                {BaseEventFullName.fireWin}
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
                  {BaseEventDescriptions.main.fireWin}
                </FormDescription>
              </span>
              <BasePredictionFormField eventName={'fireWin'} disabled={disabled} />
              <FormMessage />
            </FormItem>
          )} />
      </div>
      <div>
        <FormField
          name='baseEventRules.soleSurvivor'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='inline-flex gap-2 items-center'>
                {BaseEventFullName.soleSurvivor}
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
                  {BaseEventDescriptions.main.soleSurvivor}
                </FormDescription>
              </span>
              <BasePredictionFormField eventName={'soleSurvivor'} disabled={disabled} />
              <FormMessage />
            </FormItem>
          )} />
      </div>
    </div>
  );
}
