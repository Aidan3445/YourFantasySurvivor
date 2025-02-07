import { HelpCircle } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '~/components/ui/popover';
import { PopoverPortal } from '@radix-ui/react-popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { type DraftTiming, DraftTimingOptions, MAX_SURVIVAL_CAP } from '~/server/db/defs/leagues';

export default function LeagueSettings() {
  return (
    <section className='mx-2 pointer-events-auto'>
      <FormLabel>League Settings</FormLabel>
      <FormDescription>{'Don\'t worry, you can change these settings later.'}</FormDescription>
      <FormField
        name='survivalCap'
        render={({ field }) => (
          <FormItem>
            <span className='flex gap-2 items-center mt-1'>
              <FormLabel>Survival Cap </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <HelpCircle size={16} className='inline-block align-middle' />
                </PopoverTrigger>
                <PopoverPortal>
                  <PopoverContent className='w-80' side='top' sideOffset={14}>
                    <p className='text-sm'>{`One way to earn points is when your pick
                            survives the episode. The first episode if they're not voted out
                            you will earn 1 point, the second episode 2 points, and so on.`}
                      <br />
                      <br />
                      This setting will cap the points earned from survival streaks. Set
                      the cap to 0 to disable survival streaks entirely. Set the cap to Max
                      to allow unlimited points from survival streaks.
                    </p>
                  </PopoverContent>
                </PopoverPortal>
              </Popover>
            </span>
            <span className='flex gap-4 items-center'>
              <Select
                onValueChange={field.onChange}
                defaultValue={`${field.value}`}>
                <FormControl>
                  <SelectTrigger className='w-36'>
                    <SelectValue placeholder='Select survival cap' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={'0'}>
                    Disabled
                  </SelectItem>
                  {Array(MAX_SURVIVAL_CAP - 1).fill(0).map((_, i) => (
                    <SelectItem key={i} value={`${i + 1}`}>
                      {i + 1}
                    </SelectItem>
                  ))}
                  <SelectItem value={'1000'}>
                    Unlimited
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className='max-w-48 text-wrap'>
                Maximum points that can be earned from survival streaks
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
      <DraftTimingFormField />
    </section>
  );
}

export function DraftTimingFormField() {
  return (
    <FormField
      name='draftTiming'
      render={({ field }) => (
        <FormItem>
          <FormLabel>Draft Timing</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value as DraftTiming}>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <SelectTrigger className='w-36'>
                  <SelectValue placeholder='Select draft timing' />
                </SelectTrigger>
              </FormControl>
              <FormDescription className='max-w-48 text-wrap'>
                Do you want to draft before or after the season premieres?
              </FormDescription>
            </span>
            <SelectContent>
              {DraftTimingOptions.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />

  );
}
