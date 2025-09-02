'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { type LeagueSettingsUpdate, SurvivalCapZod } from '~/types/deprecated/leagues';
import { useLeague } from '~/hooks/useLeague';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Button } from '~/components/common/button';
import { updateAdmins, updateLeagueSettings } from '~/services/deprecated/leagueActions';
import { Input } from '~/components/common/input';
import LeagueAdminsField from '~/components/leagues/customization/settings/league/admin';

const formSchema = z.object({
  leagueName: z.string(),
  survivalCap: SurvivalCapZod,
  draftDate: z.date().optional(),
  admins: z.array(z.number())
});

export function LeagueSettings() {
  const {
    league: {
      leagueHash,
      leagueName,
      settings: {
        draftDate,
      },
      members: {
        loggedIn,
        list,
      },
    },
    refresh
  } = useLeague();

  const membersList = list.map(member => ({
    value: member.memberId,
    label: member.displayName,
    role: member.role,
  }))
    .filter(member => member.value !== loggedIn?.memberId);

  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      leagueName,
      draftDate: draftDate ?? new Date(),
      admins: membersList.filter(member => member.role === 'Admin').map(member => member.value),
    },
  });

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    const leagueUpdate: LeagueSettingsUpdate = {
      leagueName: data.leagueName,
      draftDate: data.draftDate,
    };

    try {
      await Promise.all([
        updateLeagueSettings(leagueHash, leagueUpdate),
        updateAdmins(leagueHash, data.admins),
      ]);
      await refresh();
      alert(`League settings updated for ${data.leagueName}`);
    } catch (error) {
      console.error(error);
      alert('Failed to update league some or all settings');
    }
  });

  const editable = loggedIn?.role === 'Owner';

  if (!editable) return null;

  return (
    <Form {...reactForm}>
      <form className='lg:flex-1 w-full lg:w-min flex flex-col p-2 gap-2 bg-card rounded-xl items-center' action={() => handleSubmit()}>
        <FormLabel className='text-lg font-bold text-card-foreground text-center'>Edit League Details</FormLabel>
        <FormField
          name='leagueName'
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
        {editable && <>
          <LeagueAdminsField members={membersList} />
          <Button
            className='mt-auto'
            disabled={!reactForm.formState.isDirty}
            type='submit'>Save</Button>
        </>}
      </form>
    </Form>
  );
}
