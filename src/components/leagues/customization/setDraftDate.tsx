'use client';

import { Settings } from 'lucide-react';
import { z } from 'zod';
import { type LeagueSettingsUpdate } from '~/server/db/defs/leagues';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../../ui/form';
import { Button } from '../../ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '../../ui/alertDialog';
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
    }
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
          <Settings className='cursor-pointer stroke-primary mr-2' size={34} />
        </AlertDialogTrigger>
        <AlertDialogContent className='w-min'>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Draft Type and Date</AlertDialogTitle>
            <AlertDialogDescription>
              You have the choice to draft before or after the first episode of the season.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form className='flex flex-col gap-2' action={() => handleSubmit()}>
            <DraftDateField />
            <AlertDialogFooter className='grid grid-cols-2 gap-2'>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
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
          <FormLabel>Draft Start Date</FormLabel>
          <FormControl>
            <span className='flex w-full justify-center'>
              <DateTimePicker
                date={field.value as Date}
                setDate={field.onChange}
                side='top'
                disabled={disabled} />
            </span>
          </FormControl>
        </ FormItem>
      )} />
  );
}
