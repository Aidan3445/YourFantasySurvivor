'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import SetDraftDate from './customization/setDraftDate';
import { useLeague } from '~/hooks/useLeague';
import { useRouter } from 'next/navigation';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/ui/alertDialog';

export function DraftCountdown() {
  const {
    league: {
      leagueHash,
      leagueStatus,
      members: { loggedIn, list },
      settings: { draftDate }
    },
    refresh
  } = useLeague();
  const router = useRouter();

  const editable =
    (loggedIn && loggedIn.role === 'Owner') &&
    (!draftDate || Date.now() < draftDate.getTime());

  const onDraftJoin = async () => {
    if (leagueStatus === 'Predraft') {
      const res = await fetch(`/api/leagues/${leagueHash}/draft/start`, { method: 'POST' });
      if (res.status !== 200) {
        alert(`Failed to join draft: ${res.statusText}`);
        return;
      }
      await refresh();
    }
    router.push(`/leagues/${leagueHash}/draft`);
  };

  return (
    <article className='flex flex-col w-full p-2 bg-card rounded-xl'>
      <span className='flex w-full items-start'>
        <div className='flex flex-wrap gap-x-2 items-baseline'>
          <h2 className='text-lg font-bold text-accent-foreground'>Draft Countdown</h2>
          <p className='text-sm text-muted-foreground'>
            {draftDate ?
              `Starts at: ${draftDate.toLocaleString()}` :
              'Draft set to manual start by commissioner'}
          </p>
        </div>
        <div className='flex gap-2 ml-auto'>
          {editable && list.length > 1 && leagueStatus === 'Predraft' &&
            <StartDraft startDraft={onDraftJoin} />}
          {editable && <SetDraftDate />}
        </div>
      </span>
      <span className='bg-primary rounded-2xl p-2 mt-4 text-primary-foreground text-2xl shadow shadow-black'>
        <Countdown endDate={draftDate} replacedBy={
          <Button
            className='w-full p-2 rounded-xl text-sidebar-foreground text-2xl'
            variant='positive'
            onClick={onDraftJoin}>
            Draft in progress, join now!
          </Button>
        } />
      </span>
    </article>

  );
}


interface CountdownProps {
  endDate: Date | null;
  replacedBy?: ReactNode;
}

function Countdown({ endDate, replacedBy }: CountdownProps) {
  const [timer, setTimer] = useState<number | null>(null);

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
        <CountdownPlace value={days.toString()} label={days === 1 ? 'Day' : 'Days'} />
        :
        <CountdownPlace value={hours.toString()} label={hours === 1 ? 'Hour' : 'Hours'} />
        :
        <CountdownPlace value={minutes.toString()} label={minutes === 1 ? 'Minute' : 'Minutes'} />
        :
        <CountdownPlace value={seconds.toString()} label={seconds === 1 ? 'Second' : 'Seconds'} />
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

interface StartDraftProps {
  startDraft: () => void;
}

function StartDraft({ startDraft }: StartDraftProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='positive'>Start Draft</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start Draft</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          Are you sure you want to start the draft now?
          <br />
          This action cannot be undone.
        </AlertDialogDescription>
        <AlertDialogFooter className='w-full grid grid-cols-2'>
          <AlertDialogAction onClick={startDraft}>Start Draft</AlertDialogAction>
          <AlertDialogCancel>Not Yet</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
