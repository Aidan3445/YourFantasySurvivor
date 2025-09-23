'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { useForm } from 'react-hook-form';
import { Button } from '~/components/common/button';
import { Input } from '~/components/common/input';
import LeagueAdminsField from '~/components/leagues/customization/settings/league/admin';
import { LeagueDetailsUpdateZod, type LeagueSettingsUpdate } from '~/types/leagues';
import { useQueryClient } from '@tanstack/react-query';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import updateLeagueSettings from '~/actions/updateLeagueSettings';
import updateAdmins from '~/actions/updateAdmins';

export function LeagueSettings() {
  const queryClient = useQueryClient();
  const { data: league } = useLeague();
  const { data: leagueMembers } = useLeagueMembers();

  const membersList = useMemo(() =>
    leagueMembers?.members
      .map(member => ({
        value: member.memberId,
        label: member.displayName,
        role: member.role,
      }))
      .filter(member =>
        member.value !== leagueMembers.loggedIn?.memberId && member.role !== 'Owner') ?? [],
    [leagueMembers]);

  const reactForm = useForm<LeagueSettingsUpdate>({
    defaultValues: {
      name: league?.name ?? '',
      admins: membersList.filter(m => m.role === 'Admin').map(m => m.value) ?? [],
    },
    resolver: zodResolver(LeagueDetailsUpdateZod)
  });

  useEffect(() => {
    if (league) reactForm.setValue('name', league.name);
    if (membersList.length > 0) reactForm.setValue('admins',
      membersList.filter(m => m.role === 'Admin').map(m => m.value) ?? []
    );
  }, [league, membersList, reactForm]);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    if (!league) return;

    try {
      await Promise.all([
        updateLeagueSettings(league.hash, data),
        data.admins ? updateAdmins(league.hash, data.admins) : Promise.resolve(),
      ]);
      await queryClient.invalidateQueries({ queryKey: ['league', league.hash] });
      await queryClient.invalidateQueries({ queryKey: ['settings', league.hash] });
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', league.hash] });
      alert(`League settings updated for ${data.name}`);
    } catch (error) {
      console.error(error);
      alert('Failed to update league some or all settings');
    }
  });

  const editable = (!!leagueMembers && leagueMembers.loggedIn?.role === 'Owner') && league?.status !== 'Inactive';

  if (!editable) return null;

  return (
    <Form {...reactForm}>
      <form className='lg:flex-1 w-full lg:w-min flex flex-col p-2 gap-2 bg-card rounded-xl items-center' action={() => handleSubmit()}>
        <FormLabel className='text-lg font-bold text-card-foreground text-center'>Edit League Details</FormLabel>
        <FormField
          name='name'
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormLabel className='text-lg'>League Name</FormLabel>
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
        <LeagueAdminsField members={membersList} />
        <Button className='mt-auto' disabled={!reactForm.formState.isDirty} type='submit'>
          Save
        </Button>
      </form>
    </Form>
  );
}
