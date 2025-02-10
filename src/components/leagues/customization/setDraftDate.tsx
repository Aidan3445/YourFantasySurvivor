'use client';

import { Settings } from 'lucide-react';
import { z } from 'zod';
import { DraftTimingOptions } from '~/server/db/defs/leagues';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../../ui/form';
import { DraftTimingFormField } from './leagueSettings';
import { Calendar } from '../../ui/calendar';
import { Button } from '../../ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '../../ui/alert-dialog';
import { updateDraftTiming } from '~/app/api/leagues/actions';
import { useLeague } from '~/hooks/useLeague';

const formSchema = z.object({
  draftTiming: z.enum(DraftTimingOptions),
  draftDate: z.date(),
});

export default function SetDraftDate() {
  const { league, updateLeague } = useLeague();
  const { leagueHash, settings } = league;
  const { draftTiming, draftDate } = settings;

  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      draftTiming,
      draftDate: draftDate ?? new Date(),
    },
  });

  if (!leagueHash) return null;

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      const res = await updateDraftTiming(leagueHash, data.draftTiming, data.draftDate);

      updateLeague({
        ...league,
        settings: {
          ...settings,
          draftTiming: res.draftTiming,
          draftDate: res.draftDate,
        },
      });
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
        <AlertDialogContent className='w-96'>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Draft Type and Date</AlertDialogTitle>
            <AlertDialogDescription>
              You have the choice to draft before or after the first episode of the season.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form className='flex flex-col gap-2' action={() => handleSubmit()}>
            <DraftTimingFormField />
            <FormField
              name='draftDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Draft Date</FormLabel>
                  <FormControl className='flex w-full justify-center'>
                    {/*TODO adapt range to season + timing setting*/}
                    <Calendar
                      className='border rounded-md self-center'
                      mode='single'
                      selected={field.value as Date}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()} />
                  </FormControl>
                </FormItem>
              )} />
            <AlertDialogFooter className='w-full'>
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
