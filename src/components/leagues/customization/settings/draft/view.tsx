'use client';

import { Settings, X } from 'lucide-react';
import { z } from 'zod';
import { type LeagueSettingsUpdate } from '~/types/deprecated/leagues';
import { useForm } from 'react-hook-form';
import { Form } from '~/components/common/form';
import { Button } from '~/components/common/button';
import {
  AlertDialog, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/common/alertDialog';
import { updateLeagueSettings } from '~/services/deprecated/leagueActions';
import { useLeague } from '~/hooks/useLeague';
import { useState } from 'react';
import { DraftDateField } from '~/components/leagues/customization/settings/draft/date';

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
