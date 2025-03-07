'use client';

import { HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { PopoverPortal } from '@radix-ui/react-popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { type LeagueSettingsUpdate, MAX_SURVIVAL_CAP, SurvivalCapZod } from '~/server/db/defs/leagues';
import { useLeague } from '~/hooks/useLeague';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { MultiSelect } from '~/components/ui/multiSelect';
import { Button } from '~/components/ui/button';
import { updateAdmins, updateLeagueSettings } from '~/app/api/leagues/actions';
import { Input } from '~/components/ui/input';

interface LeagueSettingsFieldsProps {
  disabled?: boolean;
}

export default function LeagueSettingsFields({ disabled }: LeagueSettingsFieldsProps) {
  return (
    <section className='mx-2'>
      <FormLabel>League Settings</FormLabel>
      <FormDescription>
        {disabled ?
          'Only the league owner can edit these settings.' :
          'Basic settings for your league.'}
      </FormDescription>
      <FormField
        name='survivalCap'
        render={({ field }) => (
          <FormItem>
            <span className='flex gap-1 items-center'>
              <FormLabel>Survival Cap </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <HelpCircle size={16} className='inline-block align-middle mt-3' />
                </PopoverTrigger>
                <PopoverPortal>
                  <PopoverContent className='w-80' side='top' sideOffset={14}>
                    <p className='text-sm'>{`One way to earn points is when your pick
                            survives the episode. The first episode if they're not voted out
                            you will earn 1 point, the second episode 2 points, and so on.`}
                      <br />
                      <br />
                      This setting will cap the points earned from survival streaks. Set
                      the cap to 0 to disable survival streaks entirely. Set the cap to Max
                      to allow unlimited points from survival streaks.
                    </p>
                  </PopoverContent>
                </PopoverPortal>
              </Popover>
            </span>
            <span className='flex gap-4 items-center'>
              <Select
                disabled={disabled}
                onValueChange={field.onChange}
                defaultValue={`${field.value}`}>
                <FormControl>
                  <SelectTrigger className='w-36'>
                    <SelectValue placeholder='Select survival cap' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={'0'}>
                    Disabled
                  </SelectItem>
                  {Array(MAX_SURVIVAL_CAP - 1).fill(0).map((_, i) => (
                    <SelectItem key={i} value={`${i + 1}`}>
                      {i + 1}
                    </SelectItem>
                  ))}
                  <SelectItem value={`${MAX_SURVIVAL_CAP}`}>
                    Unlimited
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className='max-w-48 text-wrap'>
                Maximum points that can be earned from survival streaks
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
    </section>
  );
}

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
      <form className='lg:flex-grow w-full lg:w-min flex flex-col p-2 gap-2 bg-card rounded-xl' action={() => handleSubmit()}>
        <FormLabel className='text-lg font-bold text-card-foreground'>Edit League Details</FormLabel>
        <FormField
          name='leagueName'
          render={({ field }) => (
            <FormItem>
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
interface LeagueAdminsFieldProps {
  members: { value: number, label: string, role: string }[];
}

function LeagueAdminsField({ members }: LeagueAdminsFieldProps) {
  return (
    <FormField
      name='admins'
      render={({ field }) => (
        <FormItem>
          <FormLabel>Admins</FormLabel>
          <FormDescription>
            Admins can edit league settings and help score custom events throughout the season.
          </FormDescription>
          <FormControl>
            <MultiSelect
              options={members}
              onValueChange={field.onChange}
              defaultValue={field.value as string[]}
              placeholder='Select admins' />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
  );
}
