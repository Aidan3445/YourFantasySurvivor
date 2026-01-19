'use client';

import { FormControl, FormDescription, FormField, FormItem, FormMessage } from '~/components/common/form';
import { DateTimePicker } from '~/components/common/dateTimePicker';
import { useSeasons } from '~/hooks/seasons/useSeasons';

interface DraftDateFieldProps {
  disabled?: boolean;
}

export function DraftDateField({ disabled }: DraftDateFieldProps) {
  const { data: seasons } = useSeasons(true);
  const currentSeason = seasons?.[0] ?? null;

  const rangeEnd = currentSeason?.finaleDate
    ? new Date(new Date(currentSeason.finaleDate).setHours(12, 0, 0, 0))
    : currentSeason?.premiereDate
      ? new Date(new Date(currentSeason.premiereDate).setHours(12, 0, 0, 0)).setDate(
        new Date(currentSeason.premiereDate).getDate() + (7 * 15) // 15 weeks after premiere
      )
      : undefined;

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
                rangeStart={new Date(new Date().setHours(0, 0, 0, 0))}
                rangeEnd={rangeEnd ? new Date(rangeEnd) : undefined} />
            </div>
          </FormControl>
          <FormDescription className='text-sm font-medium text-muted-foreground'>
            <span>Schedule when your draft will begin.</span>
            <br />
            <span>All league members will draft their main Survivor pick at this time.</span>
          </FormDescription>
          <FormMessage />
        </FormItem>
      )} />
  );
}

