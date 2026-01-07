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

  if (!editable) return null;

  return (
    <Form {...reactForm}>
      <form
        className='flex flex-col h-64 p-2 gap-2 bg-card rounded-xl items-center min-w-sm'
        action={() => handleSubmit()}>
        <FormLabel className='text-lg font-bold text-card-foreground text-center'>Edit League Details</FormLabel>
        <FormField
          name='name'
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormLabel className='text-lg'>
                League Name
              </FormLabel>
              <FormControl>
                <Input
                  className='w-full h-12 indent-2 placeholder:italic'
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
          className='mt-auto w-full'
          disabled={!reactForm.formState.isDirty}
          type='submit'>
          Save
        </Button>
      </form>
      {league && (
        <ManagePendingMembers hash={league.hash} open={open} />
      )}
    </Form>
  );
}
