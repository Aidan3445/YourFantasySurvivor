'use client';
import { HelpCircle } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '~/components/ui/popover';
import { PopoverPortal } from '@radix-ui/react-popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { type DraftTiming, DraftTimingOptions, MAX_SURVIVAL_CAP, SurvivalCapZod } from '~/server/db/defs/leagues';
import { useLeague } from '~/hooks/useLeague';
import { TabsContent } from '@radix-ui/react-tabs';
import { TabsTrigger } from '~/components/ui/tabs';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { DraftDateField } from './setDraftDate';
import { MultiSelect } from '~/components/ui/multiSelect';
import { Button } from '~/components/ui/button';
import { updateAdmins, updateLeagueSettings } from '~/app/api/leagues/actions';

export default function LeagueSettingsFields() {
  return (
    <section className='mx-2 pointer-events-auto'>
      <FormLabel>League Settings</FormLabel>
      <FormDescription>{'Don\'t worry, you can change these settings later.'}</FormDescription>
      <FormField
        name='survivalCap'
        render={({ field }) => (
          <FormItem>
            <span className='flex gap-2 items-center mt-1'>
              <FormLabel>Survival Cap </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <HelpCircle size={16} className='inline-block align-middle' />
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
      <DraftTimingField />
    </section>
  );
}

export function DraftTimingField() {
  return (
    <FormField
      name='draftTiming'
      render={({ field }) => (
        <FormItem>
          <FormLabel>Draft Timing</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value as DraftTiming}>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <SelectTrigger className='w-36'>
                  <SelectValue placeholder='Select draft timing' />
                </SelectTrigger>
              </FormControl>
              <FormDescription className='w-48 text-wrap'>
                Do you want to draft before or after the season premieres?
              </FormDescription>
            </span>
            <SelectContent>
              {DraftTimingOptions.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />

  );
}

export function LeagueSettingsTabTrigger() {
  const {
    league: {
      members: {
        loggedIn
      }
    }
  } = useLeague();

  if (!loggedIn || loggedIn.role === 'member') return null;

  return (
    <TabsTrigger value='league'>
      League Settings
    </TabsTrigger>
  );
}

const formSchema = z.object({
  survivalCap: SurvivalCapZod,
  draftTiming: z.enum(DraftTimingOptions),
  draftDate: z.date().optional(),
  admins: z.array(z.number())
});

export function LeagueSettingsTabContent() {
  const {
    league: {
      leagueHash,
      settings: {
        survivalCap,
        draftTiming,
        draftDate,
        draftOver
      },
      members: {
        loggedIn,
        list,
      },
    }
  } = useLeague();

  const membersList = list.map(member => ({
    value: member.memberId,
    label: member.displayName,
    role: member.role,
  }))
    .filter(member => member.value !== loggedIn?.memberId);

  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      survivalCap,
      draftTiming,
      draftDate: draftDate ?? new Date(),
      admins: membersList.filter(member => member.role === 'admin').map(member => member.value),
    },
  });

  if (!loggedIn || loggedIn.role === 'member') return null;

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      await Promise.all([
        updateLeagueSettings(leagueHash, data.survivalCap, data.draftTiming, data.draftDate),
        console.log(data.admins),
        updateAdmins(leagueHash, data.admins),
      ]);
      alert(`League settings updated for league ${leagueHash}`);
    } catch (error) {
      console.error(error);
      alert('Failed to update league some or all settings');
    }
  });

  return (
    <TabsContent value='league' >
      <Form {...reactForm}>
        <form className=' flex flex-col p-2 gap-2 bg-card rounded-lg w-96' action={() => handleSubmit()}>
          <LeagueSettingsFields />
          {!draftOver && <DraftDateField />}
          <LeagueAdminsField members={membersList} />
          <Button type='submit'>Save</Button>
        </form>
      </Form>
    </TabsContent >
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
