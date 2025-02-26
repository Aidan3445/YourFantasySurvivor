'use client';

import { Settings, X } from 'lucide-react';
import { z } from 'zod';
import { type LeagueSettingsUpdate } from '~/server/db/defs/leagues';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Button } from '~/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/ui/alertDialog';
import { updateLeagueSettings } from '~/app/api/leagues/actions';
import { useLeague } from '~/hooks/useLeague';
import { DateTimePicker } from '~/components/ui/dateTimePicker';

const formSchema = z.object({
  draftDate: z.date(),
});

export default function SetDraftDate() {
  const {
    league: {
      leagueHash,
      settings: {
        draftDate
      }
    },
    refresh
  } = useLeague();

  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      draftDate: draftDate!,
    },
  });

  if (!leagueHash) return null;

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    const leagueUpdate: LeagueSettingsUpdate = {
      draftDate: data.draftDate,
    };

    try {
      await updateLeagueSettings(leagueHash, leagueUpdate);
      await refresh();
      alert(`Draft timing updated for league ${leagueHash}`);
    } catch (error) {
      console.error(error);
      alert('Failed to update draft timing');
    }
  });

  return (
    <Form {...reactForm}>
      <AlertDialog>
        <AlertDialogTrigger>
          <Settings
            className='cursor-pointer stroke-primary hover:stroke-secondary transition-all'
            size={34} />
        </AlertDialogTrigger>
        <AlertDialogContent className='h-3/4 flex flex-col'>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Draft Type and Date</AlertDialogTitle>
            <AlertDialogDescription>
              You have the choice to draft before or after the first episode of the season.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form className='flex flex-col gap-2 justify-between h-full' action={() => handleSubmit()}>
            <DraftDateField />
            <AlertDialogFooter>
              <AlertDialogCancel className='absolute top-1 right-1 h-min p-1'>
                <X stroke='white' />
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button type='submit'>Save</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}

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
                placeholder='Start Draft Manually'
                rangeStart={new Date()} />
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
