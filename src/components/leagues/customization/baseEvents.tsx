import { Flame } from 'lucide-react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { MultiSelect } from '~/components/ui/multiSelect';
import { Switch } from '~/components/ui/switch';
import { cn } from '~/lib/utils';
import { BaseEventDescriptions, BaseEventFullName, PredictionTimingOptions, type ScoringBaseEventName } from '~/server/db/defs/events';

interface BaseEventSettingsProps {
  disabled?: boolean;
}

export function ChallengeScoreSettings({ disabled }: BaseEventSettingsProps) {
  return (
    <div>
      <FormLabel className='text-2xl'>Challenges</FormLabel>
      <FormField
        name='baseEventRules.indivWin'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='inline-flex gap-2 items-center'>
              {BaseEventFullName.indivWin}
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
                {BaseEventDescriptions.main.indivWin}
              </FormDescription>
            </span>
            <BasePredictionFormField eventName={'indivWin'} disabled={disabled} />
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='baseEventRules.indivReward'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='inline-flex gap-2 items-center'>
              {BaseEventFullName.indivReward}
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
                {BaseEventDescriptions.main.indivReward}
              </FormDescription>
            </span>
            <BasePredictionFormField eventName={'indivReward'} disabled={disabled} />
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='baseEventRules.tribe1st'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='inline-flex gap-2 items-center'>
              {BaseEventFullName.tribe1st}
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
                {BaseEventDescriptions.main.tribe1st}
              </FormDescription>
            </span>
            <BasePredictionFormField eventName={'tribe1st'} disabled={disabled} />
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='baseEventRules.tribe2nd'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='inline-flex gap-2 items-center'>
              {BaseEventFullName.tribe2nd}
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
                {BaseEventDescriptions.main.tribe2nd} <i className='text-xs text-muted-foreground'>
                  {BaseEventDescriptions.italics.tribe2nd}</i>
              </FormDescription>
            </span>
            <BasePredictionFormField eventName={'tribe2nd'} disabled={disabled} />
            <FormMessage />
          </FormItem>
        )} />
    </div>
  );
}

export function AdvantageScoreSettings({ disabled }: BaseEventSettingsProps) {
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

export function OtherScoreSettings({ disabled }: BaseEventSettingsProps) {
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

interface BasePredictionFormFieldProps extends BaseEventSettingsProps {
  eventName: ScoringBaseEventName;
}

export function BasePredictionFormField({ disabled, eventName }: BasePredictionFormFieldProps) {
  return (
    <FormField
      name={`basePredictionRules.${eventName}.enabled`}
      render={({ field: enabledField }) => (
        <>
          <span className='pl-4 inline-flex flex-wrap gap-1 items-start font-normal text-xs'>
            <FormItem className='flex gap-2 mb-2 items-center'>
              <FormLabel>
                Prediction:
              </FormLabel>
              {disabled && !enabledField.value &&
                <h2 className='font-semibold text-destructive'>Off</h2>}
              {!disabled &&
                <FormControl>
                  <Switch
                    checked={enabledField.value as boolean}
                    onCheckedChange={(checked) => enabledField.onChange(checked)} />
                </FormControl>}
            </FormItem>
            {enabledField.value && (
              <FormField
                name={`basePredictionRules.${eventName}.points`}
                render={({ field: pointsField }) => (
                  <FormItem>
                    {disabled &&
                      <h2 className='font-bold text-card-foreground text-green-600 text-nowrap'>
                        {pointsField.value}
                        <Flame size={14} className='inline align-text-bottom mb-0.5 stroke-green-600' />
                      </h2>}
                    {!disabled &&
                      <FormControl className='animate-scale-in-fast'>
                        <Input
                          className='w-14 h-min py-0 px-2 text-black'
                          type='number'
                          step={1}
                          placeholder='Points'
                          disabled={disabled}
                          {...pointsField} />
                      </FormControl>}
                  </FormItem>
                )} />)}
          </span>
          {enabledField.value && (
            <FormField
              name={`basePredictionRules.${eventName}.timing`}
              render={({ field: timingField }) => (
                <FormItem>
                  {disabled &&
                    <i className='text-muted-foreground'>- {(timingField.value as string[]).join(', ')}</i>
                  }
                  {!disabled &&
                    <FormControl className='animate-scale-in-fast mb-2'>
                      <MultiSelect
                        options={PredictionTimingOptions
                          .map((option) => ({ label: option, value: option }))}
                        onValueChange={timingField.onChange}
                        defaultValue={timingField.value as string[]}
                        value={timingField.value as string[]}
                        maxCount={1}
                        disabled={disabled}
                        empty={disabled}
                        modalPopover
                        placeholder='Select prediction timing' />
                    </FormControl>
                  }
                </FormItem>
              )} />
          )}
        </>
      )} />
  );
}
