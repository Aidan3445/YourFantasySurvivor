import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { MultiSelect } from '~/components/common/multiSelect';

interface LeagueAdminsFieldProps {
  members: { value: number, label: string, role: string }[];
}

export default function LeagueAdminsField({ members }: LeagueAdminsFieldProps) {
  return (
    <FormField
      name='admins'
      render={({ field }) => (
        <FormItem className='w-full'>
          <FormLabel>Admins</FormLabel>
          <FormDescription>
            Admins can help score events throughout the season.
          </FormDescription>
          <FormControl>
            <MultiSelect
              options={members}
              onValueChange={field.onChange}
              defaultValue={field.value as string[]}
              placeholder='Select admins' />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
  );
}

