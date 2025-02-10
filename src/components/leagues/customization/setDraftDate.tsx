'use client';

import { Settings } from 'lucide-react';
import { z } from 'zod';
import { DraftTimingOptions } from '~/server/db/defs/leagues';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../../ui/form';
import { DraftTimingField } from './leagueSettings';
import { Calendar } from '../../ui/calendar';
import { Button } from '../../ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '../../ui/alertDialog';
import { updateLeagueSettings } from '~/app/api/leagues/actions';
import { useLeague } from '~/hooks/useLeague';

const formSchema = z.object({
  draftTiming: z.enum(DraftTimingOptions),
  draftDate: z.date(),
});

export default function SetDraftDate() {
  const {
    league: {
      leagueHash,
      settings: {
        draftTiming,
        draftDate
      }
    }
  } = useLeague();

  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      draftTiming,
      draftDate: draftDate ?? new Date(),
    },
  });

  if (!leagueHash) return null;

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      await updateLeagueSettings(leagueHash, undefined, data.draftTiming, data.draftDate);
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
            <DraftTimingField />
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

export function DraftDateField() {
  return (
    <FormField
      name='draftDate'
      render={({ field }) => (
        <FormItem>
          <FormLabel>Draft Start Date</FormLabel>
          <FormControl>
            {/*TODO adapt range to season + timing setting*/}
            <span className='flex w-full justify-center'>
              <Calendar
                className='border rounded-md'
                mode='single'
                selected={field.value as Date}
                onSelect={field.onChange}
                disabled={(date) => date < new Date()} />
            </span>
          </FormControl>
        </FormItem>
      )} />
  );
}
