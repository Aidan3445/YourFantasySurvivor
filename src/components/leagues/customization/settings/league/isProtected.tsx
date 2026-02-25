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
        <FormItem className='w-11/12 mx-2'>
          <div className='bg-primary/5 border border-primary/20 rounded-lg p-4'>
            <span className='flex gap-3 items-center justify-between'>
              <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>Protected League</FormLabel>
              <FormControl>
                <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
              </FormControl>
            </span>
            <FormDescription className='mb-0 mt-2 text-sm text-muted-foreground'>
              When <b>Protected</b>, new members must be admitted from the settings tab
              by an admin to join the league.
            </FormDescription>
          </div>
          <FormMessage />
        </FormItem>
      )} />
  );
}
