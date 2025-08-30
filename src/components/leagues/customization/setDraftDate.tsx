'use client';

import { Settings, X } from 'lucide-react';
import { z } from 'zod';
import { type LeagueSettingsUpdate } from '~/server/db/defs/leagues';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Button } from '~/components/ui/button';
import {
  AlertDialog, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/ui/alertDialog';
import { updateLeagueSettings } from '~/app/api/leagues/actions';
import { useLeague } from '~/hooks/useLeague';
import { DateTimePicker } from '~/components/ui/dateTimePicker';
import { useState } from 'react';

const formSchema = z.object({
  draftDate: z.date().nullable(),
});

interface SetDraftDateProps {
  overrideLeagueHash?: string;
}

export default function SetDraftDate({ overrideLeagueHash }: SetDraftDateProps) {
  const {
    league: {
      leagueHash,
      settings: {
        draftDate
      }
    },
    refresh
  } = useLeague({ overrideLeagueHash });
  const [dialogOpen, setDialogOpen] = useState(false);

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
      console.log('Draft timing updated:', data.draftDate);
      await refresh();
      alert(`Draft timing updated: ${data.draftDate?.toLocaleString() ?? 'Manual Draft'}`);
      setDialogOpen(false);
    } catch (error) {
      console.error(error);
      alert('Failed to update draft timing');
    }
  });

  return (
    <Form {...reactForm}>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <span className='space-y-2'>
              <DraftDateField />
              {reactForm.watch('draftDate') && <>
                <h3 className='text-lg'>OR</h3>
                <Button type='button' onClick={() => reactForm.setValue('draftDate', null)}>
                  Set draft to manually start
                </Button>
              </>}
            </span>
            <AlertDialogFooter>
              <AlertDialogCancel className='absolute top-1 right-1 h-min p-1'>
                <X stroke='white' />
              </AlertDialogCancel>
              <Button type='submit'>Save</Button>
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
