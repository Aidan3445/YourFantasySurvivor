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
            <div className='flex w-full justify-center mb-4'>
              <DateTimePicker
                value={field.value ? new Date(field.value as Date) : undefined}
                onChange={field.onChange}
                rangeStart={new Date(new Date().setHours(0, 0, 0, 0))} />
            </div>
          </FormControl>
          <FormDescription className='text-sm font-medium text-muted-foreground'>
            <span className='mb-1'>Schedule when your draft will begin.</span>
            <span>All league members will draft their main Survivor pick at this time.</span>
          </FormDescription>
          <FormMessage />
        </FormItem>
      )} />
  );
}

