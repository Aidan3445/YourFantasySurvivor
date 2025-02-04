import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';

export function ChallengeScoreSettings() {
  return (
    <section>
      <FormLabel className='text-2xl'>Challenges</FormLabel>
      <FormField
        name='baseEventRules.indivWin'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Individual Immunity</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24'
                  type='number'
                  step={1}
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='max-w-60 text-wrap'>
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
            <FormLabel>Individual Reward</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  step={1}
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='max-w-60 text-wrap'>
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
            <FormLabel>Tribe 1st Place</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  step={1}
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='max-w-60 text-wrap'>
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
            <FormLabel>Tribe Place</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  step={1}
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='max-w-60 text-wrap'>
                Points if your castaway gets second in a tribe or team challenge
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
    </section>
  );
}

export function AdvantageScoreSettings() {
  return (
    <section>
      <FormLabel className='text-2xl'>Advantages</FormLabel>
      <FormField
        name='baseEventRules.advFound'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Advantage Found</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  step={1}
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='max-w-60 text-wrap'>
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
            <FormLabel>Advantage Played</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  step={1}
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='max-w-60 text-wrap'>
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
            <FormLabel>Bad Advantage Played</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  step={1}
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='max-w-60 text-wrap'>
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
            <FormLabel>Advantage Eliminated</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  step={1}
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='max-w-60 text-wrap'>
                Points if your castaway is eliminated with an advantage in their pocket (usually negative)
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
    </section>
  );
}

export function OtherScoreSettings() {
  return (
    <section>
      <FormLabel className='text-2xl'>Other</FormLabel>
      <FormField
        name='baseEventRules.spokeEpTitle'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Spoke Episode Title</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  step={1}
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='max-w-60 text-wrap'>
                Points if your castaway speaks the episode title
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='baseEventRules.finalists'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Finalists</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  step={1}
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='max-w-60 text-wrap'>
                Points if your castaway makes it to final tribal council
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='baseEventRules.fireWin'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fire Making Win</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  step={1}
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='max-w-60 text-wrap'>
                Points if your castaway wins the fire making challenge
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='baseEventRules.soleSurvivor'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sole Survivor</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  step={1}
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='max-w-60 text-wrap'>
                Points if your castaway wins the whole gosh darn thing (Sole Survivor)
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
    </section>
  );
}
