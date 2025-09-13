import { Flame } from 'lucide-react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { Input } from '~/components/common/input';
import { cn } from '~/lib/utils';
import { type BaseEventSettingsProps, BasePredictionFormField } from '~/components/leagues/customization/events/base/predictions';
import { BaseEventDescriptions, BaseEventFullName } from '~/lib/events';
import SettingsWrapper from '~/components/leagues/customization/events/base/settingsWrapper';

export default function OtherScoreSettings({ disabled, hidePredictions }: BaseEventSettingsProps) {
  return (
    <SettingsWrapper label='Other'>
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
                      className='w-24 text-black my-1'
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
              {!hidePredictions && <BasePredictionFormField eventName={'spokeEpTitle'} disabled={disabled} />}
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
                      className='w-24 text-black my-1'
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
              {!hidePredictions && <BasePredictionFormField eventName={'finalists'} disabled={disabled} />}
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
                      className='w-24 text-black my-1'
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
              {!hidePredictions && <BasePredictionFormField eventName={'fireWin'} disabled={disabled} />}
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
                      className='w-24 text-black my-1'
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
              {!hidePredictions && <BasePredictionFormField eventName={'soleSurvivor'} disabled={disabled} />}
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
                      className='w-24 text-black my-1'
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
              {!hidePredictions && <BasePredictionFormField eventName={'elim'} disabled={disabled} />}
              <FormMessage />
            </FormItem>
          )} />
      </div>
    </SettingsWrapper>
  );
}
