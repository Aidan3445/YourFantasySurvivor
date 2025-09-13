import { Flame } from 'lucide-react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { Input } from '~/components/common/input';
import { cn } from '~/lib/utils';
import { type BaseEventSettingsProps, BasePredictionFormField } from '~/components/leagues/customization/events/base/predictions';
import { BaseEventDescriptions, BaseEventFullName } from '~/lib/events';
import SettingsWrapper from '~/components/leagues/customization/events/base/settingsWrapper';

export default function ChallengeScoreSettings({ disabled, hidePredictions, children }: BaseEventSettingsProps) {
  return (
    <SettingsWrapper label='Challenges'>
      <FormField
        name='baseEventRules.indivWin'
        render={({ field }) => (
          <FormItem className={cn('rounded-lg px-1 shadow h-full transition-all', disabled ? 'bg-accent' : 'bg-orange-200')}>
            <FormLabel className='inline-flex gap-2 items-center'>
              {BaseEventFullName.indivWin}
              {disabled &&
                <h2 className={cn(
                  'text-lg font-bold text-card-foreground',
                  field.value <= 0 ? 'text-destructive' : 'text-green-600',
                  field.value === 0 && 'text-muted-foreground')}>
                  {field.value}
                  <Flame className={cn('inline align-top',
                    field.value <= 0 ? 'stroke-destructive' : 'stroke-green-600',
                    field.value === 0 && 'stroke-muted-foreground'
                  )} />
                </h2>}
            </FormLabel>
            <span className='flex gap-4 items-top'>
              {!disabled &&
                <FormControl>
                  <Input
                    className='w-24 text-black my-1'
                    type='number'
                    step={1}
                    placeholder='Points'
                    disabled={disabled}
                    {...field} />
                </FormControl>}
              <FormDescription className='max-w-72 lg:max-w-none text-wrap'>
                {BaseEventDescriptions.main.indivWin}
              </FormDescription>
            </span>
            {!hidePredictions && <BasePredictionFormField eventName={'indivWin'} disabled={disabled} />}
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='baseEventRules.indivReward'
        render={({ field }) => (
          <FormItem className={cn('rounded-lg px-1 shadow h-full transition-all', disabled ? 'bg-accent' : 'bg-orange-200')}>
            <FormLabel className='inline-flex gap-2 items-center'>
              {BaseEventFullName.indivReward}
              {disabled &&
                <h2 className={cn(
                  'text-lg font-bold text-card-foreground',
                  field.value <= 0 ? 'text-destructive' : 'text-green-600',
                  field.value === 0 && 'text-muted-foreground')}>
                  {field.value}
                  <Flame className={cn('inline align-top',
                    field.value <= 0 ? 'stroke-destructive' : 'stroke-green-600',
                    field.value === 0 && 'stroke-muted-foreground'
                  )} />
                </h2>}
            </FormLabel>
            <span className='flex gap-4 items-top'>
              {!disabled &&
                <FormControl>
                  <Input
                    className='w-24 text-black my-1'
                    type='number'
                    step={1}
                    placeholder='Points'
                    disabled={disabled}
                    {...field} />
                </FormControl>}
              <FormDescription className='max-w-72 lg:max-w-none text-wrap'>
                {BaseEventDescriptions.main.indivReward}
              </FormDescription>
            </span>
            {!hidePredictions && <BasePredictionFormField eventName={'indivReward'} disabled={disabled} />}
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='baseEventRules.tribe1st'
        render={({ field }) => (
          <FormItem className={cn('rounded-lg px-1 shadow h-full transition-all', disabled ? 'bg-accent' : 'bg-orange-200')}>
            <FormLabel className='inline-flex gap-2 items-center'>
              {BaseEventFullName.tribe1st}
              {disabled &&
                <h2 className={cn(
                  'text-lg font-bold text-card-foreground',
                  field.value <= 0 ? 'text-destructive' : 'text-green-600',
                  field.value === 0 && 'text-muted-foreground')}>
                  {field.value}
                  <Flame className={cn('inline align-top',
                    field.value <= 0 ? 'stroke-destructive' : 'stroke-green-600',
                    field.value === 0 && 'stroke-muted-foreground'
                  )} />
                </h2>}
            </FormLabel>
            <span className='flex gap-4 items-top'>
              {!disabled &&
                <FormControl>
                  <Input
                    className='w-24 text-black my-1'
                    type='number'
                    step={1}
                    placeholder='Points'
                    disabled={disabled}
                    {...field} />
                </FormControl>}
              <FormDescription className='max-w-72 lg:max-w-none text-wrap'>
                {BaseEventDescriptions.main.tribe1st}
              </FormDescription>
            </span>
            {!hidePredictions && <BasePredictionFormField eventName={'tribe1st'} disabled={disabled} />}
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='baseEventRules.tribe2nd'
        render={({ field }) => (
          <FormItem className={cn('rounded-lg px-1 shadow h-full transition-all', disabled ? 'bg-accent' : 'bg-orange-200')}>
            <FormLabel className='inline-flex gap-2 items-center'>
              {BaseEventFullName.tribe2nd}
              {disabled &&
                <h2 className={cn(
                  'text-lg font-bold text-card-foreground',
                  field.value <= 0 ? 'text-destructive' : 'text-green-600',
                  field.value === 0 && 'text-muted-foreground')}>
                  {field.value}
                  <Flame className={cn('inline align-top',
                    field.value <= 0 ? 'stroke-destructive' : 'stroke-green-600',
                    field.value === 0 && 'stroke-muted-foreground'
                  )} />
                </h2>}
            </FormLabel>
            <span className='flex gap-4 items-top'>
              {!disabled &&
                <FormControl>
                  <Input
                    className='w-24 text-black my-1'
                    type='number'
                    step={1}
                    placeholder='Points'
                    disabled={disabled}
                    {...field} />
                </FormControl>}
              <FormDescription className='max-w-72 lg:max-w-none text-wrap'>
                {BaseEventDescriptions.main.tribe2nd} <i className='text-xs text-muted-foreground'>
                  {BaseEventDescriptions.italics.tribe2nd}</i>
              </FormDescription>
            </span>
            {!hidePredictions && <BasePredictionFormField eventName={'tribe2nd'} disabled={disabled} />}
            <FormMessage />
          </FormItem>
        )} />
      {children}
    </SettingsWrapper>
  );
}
