import { Flame } from 'lucide-react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';
import { BaseEventFullName } from '~/server/db/defs/events';

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
                Points if your castaway wins an individual immunity challenge
              </FormDescription>
            </span>
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
                Points if your castaway wins an individual reward challenge
              </FormDescription>
            </span>
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
                Points if your castaway wins a tribe challenge
              </FormDescription>
            </span>
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
                Points if your castaway gets second in a tribe or team challenge
                <br />
                (only applies for 3+ tribe or team challenges)
              </FormDescription>
            </span>
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
                Points if your castaway finds an advantage
              </FormDescription>
            </span>
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
                Points if your castaway plays an advantage effectively
              </FormDescription>
            </span>
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
                Points if your castaway plays an advantage poorly or unnecessarily (usually negative)
              </FormDescription>
            </span>
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
                Points if your castaway is eliminated with an advantage in their pocket (usually negative)
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
    </div>
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
                  Points if your castaway speaks the episode title
                </FormDescription>
              </span>
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
                  Points if your castaway makes it to final tribal council
                </FormDescription>
              </span>
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
                  Points if your castaway wins the fire making challenge
                </FormDescription>
              </span>
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
                  Points if your castaway wins the whole gosh darn thing (Sole Survivor)
                </FormDescription>
              </span>
              <FormMessage />
            </FormItem>
          )} />
      </div>
    </div>
  );
}
