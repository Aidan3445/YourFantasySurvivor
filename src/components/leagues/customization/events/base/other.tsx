import { Flame } from 'lucide-react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { Input } from '~/components/common/input';
import { cn } from '~/lib/utils';
import { type BaseEventSettingsProps, BasePredictionFormField } from '~/components/leagues/customization/events/base/predictions';
import { BaseEventDescriptions, BaseEventFullName } from '~/lib/events';

export default function OtherScoreSettings({ disabled }: BaseEventSettingsProps) {
  return (
    <div className='grid grid-rows-subgrid row-span-6'>
      <FormLabel className='text-2xl'>Other</FormLabel>
      <div>
        <FormField
          name='baseEventRules.spokeEpTitle'
          render={({ field }) => (
            <FormItem className={cn('rounded-lg px-1 shadow h-full transition-all', disabled ? 'bg-accent' : 'bg-orange-200')}>
              <FormLabel className='inline-flex gap-2 items-center'>
                {BaseEventFullName.spokeEpTitle}
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
                      className='w-24 text-black'
                      type='number'
                      step={1}
                      placeholder='Points'
                      disabled={disabled}
                      {...field} />
                  </FormControl>}
                <FormDescription className='max-w-72 lg:max-w-none text-wrap'>
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
            <FormItem className={cn('rounded-lg px-1 shadow h-full transition-all', disabled ? 'bg-accent' : 'bg-orange-200')}>
              <FormLabel className='inline-flex gap-2 items-center'>
                {BaseEventFullName.finalists}
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
                      className='w-24 text-black'
                      type='number'
                      step={1}
                      placeholder='Points'
                      disabled={disabled}
                      {...field} />
                  </FormControl>}
                <FormDescription className='max-w-72 lg:max-w-none text-wrap'>
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
            <FormItem className={cn('rounded-lg px-1 shadow h-full transition-all', disabled ? 'bg-accent' : 'bg-orange-200')}>
              <FormLabel className='inline-flex gap-2 items-center'>
                {BaseEventFullName.fireWin}
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
                      className='w-24 text-black'
                      type='number'
                      step={1}
                      placeholder='Points'
                      disabled={disabled}
                      {...field} />
                  </FormControl>}
                <FormDescription className='max-w-72 lg:max-w-none text-wrap'>
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
            <FormItem className={cn('rounded-lg px-1 shadow h-full transition-all', disabled ? 'bg-accent' : 'bg-orange-200')}>
              <FormLabel className='inline-flex gap-2 items-center'>
                {BaseEventFullName.soleSurvivor}
                {disabled &&
                  <h2 className={cn(
                    'text-lg font-bold text-card-foreground',
                    field.value <= 0 ? 'text-destructive' : 'text-green-600',
                    field.value === 0 && 'text-muted-foreground'
                  )}>
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
                      className='w-24 text-black'
                      type='number'
                      step={1}
                      placeholder='Points'
                      disabled={disabled}
                      {...field} />
                  </FormControl>}
                <FormDescription className='max-w-72 lg:max-w-none text-wrap'>
                  {BaseEventDescriptions.main.soleSurvivor}
                </FormDescription>
              </span>
              <BasePredictionFormField eventName={'soleSurvivor'} disabled={disabled} />
              <FormMessage />
            </FormItem>
          )} />
      </div>
      <div>
        <FormField
          name='baseEventRules.elim'
          render={({ field }) => (
            <FormItem className={cn('rounded-lg px-1 shadow h-full transition-all', disabled ? 'bg-accent' : 'bg-orange-200')}>
              <FormLabel className='inline-flex gap-2 items-center'>
                {BaseEventFullName.elim}
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
                      className='w-24 text-black'
                      type='number'
                      step={1}
                      placeholder='Points'
                      disabled={disabled}
                      {...field} />
                  </FormControl>}
                <FormDescription className='max-w-72 lg:max-w-none text-wrap'>
                  {BaseEventDescriptions.main.elim}
                </FormDescription>
              </span>
              <BasePredictionFormField eventName={'elim'} disabled={disabled} />
              <FormMessage />
            </FormItem>
          )} />
      </div>
    </div>
  );
}
