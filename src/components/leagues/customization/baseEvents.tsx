import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';

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
            <FormLabel className='inline-flex gap-2 items-center'>Individual Immunity
              {disabled &&
                <h2 className={cn(
                  'text-lg font-bold text-card-foreground',
                  field.value <= 0 ? 'text-destructive' : 'text-green-600')}>
                  {field.value}
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
            <FormLabel className='inline-flex gap-2 items-center'>Individual Reward
              {disabled &&
                <h2 className={cn(
                  'text-lg font-bold text-card-foreground',
                  field.value <= 0 ? 'text-destructive' : 'text-green-600')}>
                  {field.value}
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
            <FormLabel className='inline-flex gap-2 items-center'>Tribe/Team 1st Place
              {disabled &&
                <h2 className={cn(
                  'text-lg font-bold text-card-foreground',
                  field.value <= 0 ? 'text-destructive' : 'text-green-600')}>
                  {field.value}
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
            <FormLabel className='inline-flex gap-2 items-center'>Tribe/Team 2nd Place
              {disabled &&
                <h2 className={cn(
                  'text-lg font-bold text-card-foreground',
                  field.value <= 0 ? 'text-destructive' : 'text-green-600')}>
                  {field.value}
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
            <FormLabel className='inline-flex gap-2 items-center'>Advantage Found
              {disabled &&
                <h2 className={cn(
                  'text-lg font-bold text-card-foreground',
                  field.value <= 0 ? 'text-destructive' : 'text-green-600')}>
                  {field.value}
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
            <FormLabel className='inline-flex gap-2 items-center'>Advantage Played
              {disabled &&
                <h2 className={cn(
                  'text-lg font-bold text-card-foreground',
                  field.value <= 0 ? 'text-destructive' : 'text-green-600')}>
                  {field.value}
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
            <FormLabel className='inline-flex gap-2 items-center'>Bad Advantage Played
              {disabled &&
                <h2 className={cn(
                  'text-lg font-bold text-card-foreground',
                  field.value <= 0 ? 'text-destructive' : 'text-green-600')}>
                  {field.value}
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
            <FormLabel className='inline-flex gap-2 items-center'>Advantage Eliminated
              {disabled &&
                <h2 className={cn(
                  'text-lg font-bold text-card-foreground',
                  field.value <= 0 ? 'text-destructive' : 'text-green-600')}>
                  {field.value}
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
              <FormLabel className='inline-flex gap-2 items-center'>Spoke Episode Title
                {disabled &&
                  <h2 className={cn(
                    'text-lg font-bold text-card-foreground',
                    field.value <= 0 ? 'text-destructive' : 'text-green-600')}>
                    {field.value}
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
              <FormLabel className='inline-flex gap-2 items-center'>Finalists
                {disabled &&
                  <h2 className={cn(
                    'text-lg font-bold text-card-foreground',
                    field.value <= 0 ? 'text-destructive' : 'text-green-600')}>
                    {field.value}
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
              <FormLabel className='inline-flex gap-2 items-center'>Fire Making Win
                {disabled &&
                  <h2 className={cn(
                    'text-lg font-bold text-card-foreground',
                    field.value <= 0 ? 'text-destructive' : 'text-green-600')}>
                    {field.value}
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
              <FormLabel className='inline-flex gap-2 items-center'>Sole Survivor
                {disabled &&
                  <h2 className={cn(
                    'text-lg font-bold text-card-foreground',
                    field.value <= 0 ? 'text-destructive' : 'text-green-600')}>
                    {field.value}
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
