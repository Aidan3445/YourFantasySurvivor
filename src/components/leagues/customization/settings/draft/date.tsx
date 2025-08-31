import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { DateTimePicker } from '~/components/common/dateTimePicker';

interface DraftDateFieldProps {
    disabled?: boolean;
  }
  
  export function DraftDateField({ disabled }: DraftDateFieldProps) {
    return (
      <FormField
        name='draftDate'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-lg'>Draft Start Date</FormLabel>
            <FormControl>
              <span className='flex w-full justify-center'>
                <DateTimePicker
                  date={field.value as Date}
                  setDate={field.onChange}
                  side='top'
                  disabled={disabled}
                  placeholder='Select draft start date and time'
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
  