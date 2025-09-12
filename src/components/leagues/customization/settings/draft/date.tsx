import { FormControl, FormDescription, FormField, FormItem, FormMessage } from '~/components/common/form';
import { DateTimePicker } from '~/components/common/dateTimePicker';

interface DraftDateFieldProps {
  disabled?: boolean;
}

export function DraftDateField({ disabled }: DraftDateFieldProps) {
  return (
    <FormField
      name='draftDate'
      render={({ field }) => (
        <FormItem className={disabled ? 'opacity-50 pointer-events-none' : ''}>
          <FormControl>
            <span className='flex w-full justify-center mb-4'>
              <DateTimePicker
                value={field.value ? new Date(field.value as Date) : undefined}
                onChange={field.onChange}
                rangeStart={new Date(new Date().setHours(0, 0, 0, 0))} />
            </span>
          </FormControl>
          <FormDescription className='text-sm text-left'>
            Set when your league’s draft will take place or manually start the draft later.
            <br />
            Everyone in your league will draft their main Survivor pick on this date.
          </FormDescription>
          <FormMessage />
        </ FormItem>
      )} />
  );
}

