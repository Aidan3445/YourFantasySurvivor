'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { useForm } from 'react-hook-form';
import { Button } from '~/components/common/button';
import { Input } from '~/components/common/input';
import { LeagueDetailsUpdateZod, type LeagueSettingsUpdate } from '~/types/leagues';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import updateLeagueSettings from '~/actions/updateLeagueSettings';
import { useLeagueData } from '~/hooks/leagues/enrich/useLeagueData';
import ManagePendingMembers from '~/components/leagues/customization/settings/league/admitPending';
import IsProtectedToggle from '~/components/leagues/customization/settings/league/isProtected';

export default function LeagueSettings() {
  const queryClient = useQueryClient();
  const { league, leagueSettings, leagueMembers } = useLeagueData();
  const [open, setOpen] = useState(false);

  const reactForm = useForm<LeagueSettingsUpdate>({
    defaultValues: {
      name: league?.name ?? '',
      isProtected: leagueSettings?.isProtected ?? true
    },
    resolver: zodResolver(LeagueDetailsUpdateZod)
  });

  useEffect(() => {
    if (league) reactForm.setValue('name', league.name);
    if (leagueSettings) reactForm.setValue('isProtected', leagueSettings.isProtected);
  }, [league, leagueSettings, reactForm]);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    if (!league) return;
    if (leagueMembers?.loggedIn?.role !== 'Owner') {
      alert('Only the league Owner can update league settings.');
      return;
    }

    try {
      await updateLeagueSettings(league.hash, data);
      await queryClient.invalidateQueries({ queryKey: ['league', league.hash] });
      await queryClient.invalidateQueries({ queryKey: ['settings', league.hash] });
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', league.hash] });
      alert(`League settings updated for ${data.name}`);
      reactForm.reset(data);

      if (data.isProtected === false) setOpen(true);
    } catch (error) {
      console.error(error);
      alert('Failed to update league some or all settings');
    }
  });

  const editable = (!!leagueMembers && leagueMembers.loggedIn?.role === 'Owner') && league?.status !== 'Inactive';

  if (leagueMembers?.loggedIn?.role !== 'Owner') {
    return null;
  }

  return (
    <div className={editable ? '' : 'pointer-events-none opacity-50'}>
      <Form {...reactForm}>
        <form
          className='flex flex-col p-4 gap-3 bg-card rounded-lg border-2 border-primary/20 shadow-lg shadow-primary/10 items-center sm:min-w-sm'
          action={() => handleSubmit()}>
          <div className='flex w-full items-center justify-start gap-3 h-8'>
            <span className='h-4 md:h-6 w-1 bg-primary rounded-full' />
            <FormLabel className='md:text-xl font-black uppercase tracking-tight leading-none text-nowrap'>
              Edit League Details
            </FormLabel>
          </div>
          <FormField
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
                  League Name
                </FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    autoComplete='off'
                    autoCapitalize='on'
                    placeholder='League Name'
                    {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          <IsProtectedToggle />
          <Button
            className='mt-auto w-full font-bold uppercase text-xs tracking-wider'
            disabled={!reactForm.formState.isDirty}
            type='submit'>
            Save
          </Button>
        </form>
        {league && (
          <ManagePendingMembers hash={league.hash} open={open} />
        )}
      </Form>
    </div>
  );
}
