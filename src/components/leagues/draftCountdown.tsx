'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useLeague } from '~/hooks/useLeague';
import { Settings } from 'lucide-react';
import { z } from 'zod';
import { DraftTimingOptions } from '~/server/db/defs/leagues';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { DraftTimingFormField } from './customization/leagueSettings';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { updateDraftTiming } from '~/app/api/leagues/actions';

export function DraftCountdown() {
  const { currentLeague: { settings: { draftTiming, draftDate } } } = useLeague();

  return (
    <article className='flex flex-col w-full p-2 bg-accent rounded-xl'>
      <span className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-bold text-accent-foreground'>Draft Countdown</h2>
          <p className='text-sm text-muted-foreground'>
            {draftDate ? draftDate.toLocaleString() : 'Draft date not set'}
          </p>
        </div>
        <div className='text-center text-xl'>
          Draft type:
          <div className='text-sm text-muted-foreground'>
            {draftTiming}
          </div>
        </div>
        <SetDraftDate />
      </span>
      <span className='bg-primary rounded-2xl p-2 m-4 text-primary-foreground text-2xl shadow shadow-black'>
        <Countdown endDate={draftDate} />
      </span>
    </article>

  );
}

const formSchema = z.object({
  draftTiming: z.enum(DraftTimingOptions),
  draftDate: z.date(),
});

function SetDraftDate() {
  const { currentLeague: { league, settings }, updateLeague } = useLeague();
  const { leagueId } = league;
  const { draftTiming, draftDate } = settings;

  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      draftTiming,
      draftDate: draftDate ?? new Date(),
    },
  });

  if (!leagueId) return null;

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      const res = await updateDraftTiming(leagueId, data.draftTiming, data.draftDate);

      updateLeague({
        league, league_settings: {
          ...settings,
          draftTiming: res.draftTiming,
          draftDate: res.draftDate,
        }
      });
      alert(`Draft timing updated for league ${leagueId}`);
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
                    <div>
                      <Calendar
                        className='border rounded-md self-center'
                        mode='single'
                        selected={field.value as Date}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()} />
                    </div>
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

interface CountdownProps {
  endDate: Date | null;
  replacedBy?: ReactNode;
}

function Countdown({ endDate, replacedBy }: CountdownProps) {
  const [timer, setTimer] = useState<number | null>(endDate ? endDate.getTime() - Date.now() : null);

  useEffect(() => {
    if (!endDate || (timer !== null && timer <= 0)) return;
    if (timer === null) setTimer(endDate.getTime() - Date.now());

    const interval = setInterval(() => {
      setTimer(endDate.getTime() - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate, timer]);

  const days = timer ? Math.floor(timer / (1000 * 60 * 60 * 24)) : '--';
  const hours = timer ? Math.floor((timer / (1000 * 60 * 60)) % 24) : '--';
  const minutes = timer ? Math.floor((timer / (1000 * 60)) % 60) : '--';
  const seconds = timer ? Math.floor((timer / 1000) % 60) : '--';

  return (
    !timer || timer > 0 ?
      <span className='w-full flex text-white text-4xl  justify-evenly'>
        <CountdownPlace value={days.toString()} label='Days' />
        :
        <CountdownPlace value={hours.toString()} label='Hours' />
        :
        <CountdownPlace value={minutes.toString()} label='Minutes' />
        :
        <CountdownPlace value={seconds.toString()} label='Seconds' />
      </span>
      :
      replacedBy
  );
}

interface CountdownPlaceProps {
  value: string;
  label: string;
}

function CountdownPlace({ value, label }: CountdownPlaceProps) {
  return (
    <div className='flex flex-col text-center'>
      <h1 className='text-4xl font-bold text-sidebar'>{value}</h1>
      <p className='text-xs text-muted'>{label}</p>
    </div>
  );
}
