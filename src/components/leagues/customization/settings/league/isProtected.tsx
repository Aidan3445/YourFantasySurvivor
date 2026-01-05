import {
  FormControl, FormDescription, FormField,
  FormItem, FormLabel, FormMessage
} from '~/components/common/form';
import { Switch } from '~/components/common/switch';

export default function IsProtectedToggle() {
  return (
    <FormField
      name='isProtected'
      render={({ field }) => (
        <FormItem className='w-full'>
          <span className='flex gap-2 items-center'>
            <FormLabel className='text-base'>Protected League</FormLabel>
            <FormControl>
              <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
            </FormControl>
          </span>
          <FormDescription className='mb-0 mt-1 text-sm text-muted-foreground'>
            When <b>Protected</b>, new members must be admitted from the settings tab
            by an admin to join the league.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )} />
  );
}
