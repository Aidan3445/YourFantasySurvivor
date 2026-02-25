'use client';

import { Settings, X } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Form } from '~/components/common/form';
import { Button } from '~/components/common/button';
import {
  AlertDialog, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/common/alertDialog';
import { useEffect, useState } from 'react';
import { DraftDateField } from '~/components/leagues/customization/settings/draft/date';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useLeagueSettings } from '~/hooks/leagues/useLeagueSettings';
import { type LeagueSettingsUpdate } from '~/types/leagues';
import updateLeagueSettings from '~/actions/updateLeagueSettings';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';

const formSchema = z.object({
  draftDate: z.date().nullable(),
});

interface SetDraftDateProps {
  overrideHash?: string;
}

export default function SetDraftDate({ overrideHash }: SetDraftDateProps) {
  const queryClient = useQueryClient();
  const { data: league } = useLeague(overrideHash);
  const { data: leagueSettings } = useLeagueSettings(overrideHash);
  const [dialogOpen, setDialogOpen] = useState(false);

  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      draftDate: leagueSettings?.draftDate
    },
    resolver: zodResolver(formSchema)
  });

  useEffect(() => {
    if (leagueSettings) {
      reactForm.reset({
        draftDate: leagueSettings.draftDate
      });
    }
  }, [leagueSettings, reactForm]);

  if (!league) return null;

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    const leagueUpdate: LeagueSettingsUpdate = {
      draftDate: data.draftDate,
    };

    try {
      await updateLeagueSettings(league.hash, leagueUpdate);
      await queryClient.invalidateQueries({ queryKey: ['settings', league.hash] });
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
        <AlertDialogTrigger asChild>
          <Settings className='w-8 h-8 cursor-pointer stroke-primary hover:stroke-secondary active:stroke-secondary/75 transition-all' />
        </AlertDialogTrigger>
        <AlertDialogContent className='h-3/4 flex flex-col border-primary/30 shadow-lg shadow-primary/20'>
          <AlertDialogHeader>
            <span className='flex items-center gap-3 mb-2'>
              <span className='h-6 w-1 bg-primary rounded-full' />
              <AlertDialogTitle className='text-2xl font-black uppercase tracking-tight'>
                Draft Settings
              </AlertDialogTitle>
            </span>
            <AlertDialogDescription className='text-base'>
              Schedule your draft or set it to manual start by the commissioner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ScrollArea className='max-h-[60vh] w-full px-2'>
            <section className='flex flex-col gap-2'>
              <form className='flex flex-col gap-4 justify-between h-full' action={() => handleSubmit()}>
                <div className='space-y-4'>
                  <div className='bg-primary/5 border border-primary/20 rounded-lg p-4'>
                    <DraftDateField />
                  </div>
                  {reactForm.watch('draftDate') && (
                    <>
                      <div className='flex items-center gap-3'>
                        <div className='flex-1 h-px bg-border' />
                        <span className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>OR</span>
                        <div className='flex-1 h-px bg-border' />
                      </div>
                      <Button
                        type='button'
                        variant='outline'
                        className='w-full font-bold uppercase text-xs tracking-wider border-primary/30 hover:bg-primary/10'
                        onClick={() => reactForm.setValue('draftDate', null)}>
                        Switch to Manual Start
                      </Button>
                    </>
                  )}
                </div>
                <AlertDialogFooter className='gap-3'>
                  <AlertDialogCancel className='absolute top-4 right-4 h-auto w-auto p-2 bg-destructive/10 border-destructive/30 hover:bg-destructive/20'>
                    <X className='w-4 h-4' />
                  </AlertDialogCancel>
                  <AlertDialogCancel className='font-bold uppercase text-xs tracking-wider'>
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    type='submit'
                    className='font-bold uppercase text-xs tracking-wider shadow-lg hover:shadow-xl transition-all'>
                    Save Settings
                  </Button>
                </AlertDialogFooter>
              </form>
            </section>
            <ScrollBar orientation='vertical' forceMount />
          </ScrollArea>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
