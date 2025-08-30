'use client';

import { Button } from '~/components/common/button';
import SetDraftDate from '~/components/leagues/customization/setDraftDate';
import { useLeague } from '~/hooks/useLeague';
import { useRouter } from 'next/navigation';
import Clock from './clock';
import StartDraft from './start';

interface DraftCountdownProps {
  overrideLeagueHash?: string;
}

export function DraftCountdown({ overrideLeagueHash }: DraftCountdownProps) {
  const {
    league: {
      leagueHash,
      leagueStatus,
      members: { loggedIn, list },
      settings: { draftDate }
    },
    refresh
  } = useLeague({ overrideLeagueHash });
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
            {draftDate
              ? (draftDate.getTime() > Date.now()
                ? `Starts at: ${draftDate.toLocaleString()}`
                : 'Draft is live')
              : 'Draft set to manual start by commissioner'}
          </p>
        </div>
        <div className='flex gap-2 ml-auto'>
          {editable && list.length > 1 && leagueStatus === 'Predraft' &&
            <StartDraft startDraft={onDraftJoin} />}
          {editable && <SetDraftDate overrideLeagueHash={overrideLeagueHash} />}
        </div>
      </span>
      <span className='bg-primary rounded-2xl p-2 mt-4 text-primary-foreground text-2xl shadow-sm shadow-black'>
        <Clock endDate={draftDate} replacedBy={
          <Button
            className='w-full p-2 rounded-xl text-sidebar-foreground text-2xl'
            variant='positive'
            onClick={onDraftJoin}>
            Join now!
          </Button>
        } />
      </span>
    </article>
  );
}