import { Flame } from 'lucide-react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { Input } from '~/components/common/input';
import { cn } from '~/lib/utils';
import { type BaseEventSettingsProps, BasePredictionFormField } from '~/components/leagues/customization/events/base/predictions';
import { BaseEventDescriptions, BaseEventFullName } from '~/lib/events';
import SettingsWrapper from '~/components/leagues/customization/events/base/settingsWrapper';

export default function AdvantageScoreSettings({ disabled, hidePredictions, children }: BaseEventSettingsProps) {
  return (
    <SettingsWrapper label='Advantages'>
      <FormField
        name='baseEventRules.advFound'
        render={({ field }) => (
          <FormItem className={cn('rounded-lg px-1 shadow h-full transition-all', disabled ? 'bg-accent' : 'bg-orange-200')}>
            <FormLabel className='inline-flex gap-2 items-center'>
              {BaseEventFullName.advFound}
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
                {BaseEventDescriptions.main.advFound}
              </FormDescription>
            </span>
            {!hidePredictions && <BasePredictionFormField eventName={'advFound'} disabled={disabled} />}
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='baseEventRules.advPlay'
        render={({ field }) => (
          <FormItem className={cn('rounded-lg px-1 shadow h-full transition-all', disabled ? 'bg-accent' : 'bg-orange-200')}>
            <FormLabel className='inline-flex gap-2 items-center'>
              {BaseEventFullName.advPlay}
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
                {BaseEventDescriptions.main.advPlay}
              </FormDescription>
            </span>
            {!hidePredictions && <BasePredictionFormField eventName={'advPlay'} disabled={disabled} />}
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='baseEventRules.badAdvPlay'
        render={({ field }) => (
          <FormItem className={cn('rounded-lg px-1 shadow h-full transition-all', disabled ? 'bg-accent' : 'bg-orange-200')}>
            <FormLabel className='inline-flex gap-2 items-center'>
              {BaseEventFullName.badAdvPlay}
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
                {BaseEventDescriptions.main.badAdvPlay} <i className='text-xs text-muted-foreground'>
                  {BaseEventDescriptions.italics.badAdvPlay}</i>
              </FormDescription>
            </span>
            {!hidePredictions && <BasePredictionFormField eventName={'badAdvPlay'} disabled={disabled} />}
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='baseEventRules.advElim'
        render={({ field }) => (
          <FormItem className={cn('rounded-lg px-1 shadow h-full transition-all', disabled ? 'bg-accent' : 'bg-orange-200')}>
            <FormLabel className='inline-flex gap-2 items-center'>
              {BaseEventFullName.advElim}
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
                {BaseEventDescriptions.main.advElim} <i className='text-xs text-muted-foreground'>
                  {BaseEventDescriptions.italics.advElim}</i>
              </FormDescription>
            </span>
            {!hidePredictions && <BasePredictionFormField eventName={'advElim'} disabled={disabled} />}
            <FormMessage />
          </FormItem>
        )} />
      {children}
    </SettingsWrapper>
  );
}

