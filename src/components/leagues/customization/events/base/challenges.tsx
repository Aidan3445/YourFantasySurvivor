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
          <FormItem className={cn('rounded-lg px-3 py-2 h-full transition-all border-2', disabled ? 'bg-accent border-primary/20' : 'bg-primary/5 border-primary/30')}>
            <FormLabel className='inline-flex gap-2 items-center text-sm font-bold uppercase tracking-wider'>
              {BaseEventFullName.indivWin}
              {disabled &&
                <h2 className={cn(
                  'text-lg font-bold text-card-foreground',
                  field.value <= 0 ? 'text-destructive' : 'text-green-600',
                  field.value === 0 && 'text-muted-foreground')}>
                  {field.value}
                  <Flame className={cn('inline align-top w-5 h-5 shrink-0',
                    field.value <= 0 ? 'stroke-destructive' : 'stroke-green-600',
                    field.value === 0 && 'stroke-muted-foreground'
                  )} />
                </h2>}
            </FormLabel>
            <div className='flex-col gap-4 items-top'>
              {!disabled &&
                <FormControl>
                  <Input
                    className='w-full my-1 border-2 border-primary/20 focus:border-primary/40 font-medium'
                    type='number'
                    step={1}
                    placeholder='Points'
                    disabled={disabled}
                    {...field} />
                </FormControl>}
              <FormDescription className='max-w-72 lg:max-w-none text-wrap text-sm'>
                {BaseEventDescriptions.main.indivWin}
              </FormDescription>
            </div>
            {!hidePredictions && <BasePredictionFormField eventName={'indivWin'} disabled={disabled} />}
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='baseEventRules.indivReward'
        render={({ field }) => (
          <FormItem className={cn('rounded-lg px-3 py-2 h-full transition-all border-2', disabled ? 'bg-accent border-primary/20' : 'bg-primary/5 border-primary/30')}>
            <FormLabel className='inline-flex gap-2 items-center text-sm font-bold uppercase tracking-wider'>
              {BaseEventFullName.indivReward}
              {disabled &&
                <h2 className={cn(
                  'text-lg font-bold text-card-foreground',
                  field.value <= 0 ? 'text-destructive' : 'text-green-600',
                  field.value === 0 && 'text-muted-foreground')}>
                  {field.value}
                  <Flame className={cn('inline align-top w-5 h-5 shrink-0',
                    field.value <= 0 ? 'stroke-destructive' : 'stroke-green-600',
                    field.value === 0 && 'stroke-muted-foreground'
                  )} />
                </h2>}
            </FormLabel>
            <div className='flex-col gap-4 items-top'>
              {!disabled &&
                <FormControl>
                  <Input
                    className='w-full my-1 border-2 border-primary/20 focus:border-primary/40 font-medium'
                    type='number'
                    step={1}
                    placeholder='Points'
                    disabled={disabled}
                    {...field} />
                </FormControl>}
              <FormDescription className='max-w-72 lg:max-w-none text-wrap text-sm'>
                {BaseEventDescriptions.main.indivReward}
              </FormDescription>
            </div>
            {!hidePredictions && <BasePredictionFormField eventName={'indivReward'} disabled={disabled} />}
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='baseEventRules.tribe1st'
        render={({ field }) => (
          <FormItem className={cn('rounded-lg px-3 py-2 h-full transition-all border-2', disabled ? 'bg-accent border-primary/20' : 'bg-primary/5 border-primary/30')}>
            <FormLabel className='inline-flex gap-2 items-center text-sm font-bold uppercase tracking-wider'>
              {BaseEventFullName.tribe1st}
              {disabled &&
                <h2 className={cn(
                  'text-lg font-bold text-card-foreground',
                  field.value <= 0 ? 'text-destructive' : 'text-green-600',
                  field.value === 0 && 'text-muted-foreground')}>
                  {field.value}
                  <Flame className={cn('inline align-top w-5 h-5 shrink-0',
                    field.value <= 0 ? 'stroke-destructive' : 'stroke-green-600',
                    field.value === 0 && 'stroke-muted-foreground'
                  )} />
                </h2>}
            </FormLabel>
            <div className='flex-col gap-4 items-top'>
              {!disabled &&
                <FormControl>
                  <Input
                    className='w-full my-1 border-2 border-primary/20 focus:border-primary/40 font-medium'
                    type='number'
                    step={1}
                    placeholder='Points'
                    disabled={disabled}
                    {...field} />
                </FormControl>}
              <FormDescription className='max-w-72 lg:max-w-none text-wrap text-sm'>
                {BaseEventDescriptions.main.tribe1st}
              </FormDescription>
            </div>
            {!hidePredictions && <BasePredictionFormField eventName={'tribe1st'} disabled={disabled} />}
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='baseEventRules.tribe2nd'
        render={({ field }) => (
          <FormItem className={cn('rounded-lg px-3 py-2 h-full transition-all border-2', disabled ? 'bg-accent border-primary/20' : 'bg-primary/5 border-primary/30')}>
            <FormLabel className='inline-flex gap-2 items-center text-sm font-bold uppercase tracking-wider'>
              {BaseEventFullName.tribe2nd}
              {disabled &&
                <h2 className={cn(
                  'text-lg font-bold text-card-foreground',
                  field.value <= 0 ? 'text-destructive' : 'text-green-600',
                  field.value === 0 && 'text-muted-foreground')}>
                  {field.value}
                  <Flame className={cn('inline align-top w-5 h-5 shrink-0',
                    field.value <= 0 ? 'stroke-destructive' : 'stroke-green-600',
                    field.value === 0 && 'stroke-muted-foreground'
                  )} />
                </h2>}
            </FormLabel>
            <div className='flex-col gap-4 items-top'>
              {!disabled &&
                <FormControl>
                  <Input
                    className='w-full my-1 border-2 border-primary/20 focus:border-primary/40 font-medium'
                    type='number'
                    step={1}
                    placeholder='Points'
                    disabled={disabled}
                    {...field} />
                </FormControl>}
              <FormDescription className='max-w-72 lg:max-w-none text-wrap text-sm'>
                {BaseEventDescriptions.main.tribe2nd} <i className='text-xs text-muted-foreground'>
                  {BaseEventDescriptions.italics.tribe2nd}</i>
              </FormDescription>
            </div>
            {!hidePredictions && <BasePredictionFormField eventName={'tribe2nd'} disabled={disabled} />}
            <FormMessage />
          </FormItem>
        )} />
      {children}
    </SettingsWrapper>
  );
}
