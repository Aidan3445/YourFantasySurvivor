'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useLeague } from '~/hooks/useLeague';
import SetDraftDate from './customization/setDraftDate';
import { Button } from '~/components/ui/button';
import { useRouter } from 'next/navigation';

export function DraftCountdown() {
  const {
    league: {
      leagueHash,
      leagueStatus,
      members: { loggedIn },
      settings: { draftDate }
    },
    updateLeagueStatus
  } = useLeague();
  const router = useRouter();

  const editable =
    (loggedIn && loggedIn.role === 'Owner') &&
    (!draftDate || Date.now() < draftDate.getTime());

  const onDraftJoin = async () => {
    if (leagueStatus === 'Predraft') {
      const res = await fetch(`/api/leagues/${leagueHash}/draft/start`, { method: 'POST' });
      if (res.status !== 200) {
        alert(`Failed to start draft: ${res.statusText}`);
        return;
      }
      updateLeagueStatus('Draft');
      router.push(`/leagues/${leagueHash}/draft`);
    }
  };

  return (
    <article className='flex flex-col w-full p-2 bg-card rounded-xl'>
      <span className='grid grid-cols-3 w-full items-center'>
        <div>
          <h2 className='text-lg font-bold text-accent-foreground'>Draft Countdown</h2>
          <p className='text-sm text-muted-foreground'>
            {draftDate ? draftDate.toLocaleString() : 'Draft date not set'}
          </p>
        </div>
        <div className='text-center text-base font-semibold'>
          Draft type
          <div className='text-sm text-muted-foreground font-normal'>
            --
          </div>
        </div>
        <div className='flex gap-2 justify-end'>
          {editable && <SetDraftDate />}
        </div>
      </span>
      <span className='bg-primary rounded-2xl p-2 m-4 text-primary-foreground text-2xl shadow shadow-black'>
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
