'use client';

import { Button } from '~/components/common/button';
import SetDraftDate from '~/components/leagues/customization/settings/draft/view';
import { useRouter } from 'next/navigation';
import Clock from '~/components/leagues/predraft/countdown/clock';
import StartDraft from '~/components/leagues/predraft/countdown/start';
import { useLeagueSettings } from '~/hooks/leagues/useLeagueSettings';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

interface DraftCountdownProps {
  overrideHash?: string;
}

export function DraftCountdown({ overrideHash }: DraftCountdownProps) {
  const queryClient = useQueryClient();
  const { data: league } = useLeague(overrideHash);
  const { data: leagueSettings } = useLeagueSettings(overrideHash);
  const { data: leagueMembers } = useLeagueMembers(overrideHash);

  const router = useRouter();

  const editable = useMemo(() =>
    leagueMembers?.loggedIn?.role === 'Owner' && leagueSettings &&
    (leagueSettings.draftDate === null || Date.now() < leagueSettings.draftDate.getTime()),
    [leagueMembers, leagueSettings]);

  const onDraftJoin = async () => {
    if (!league) return;

    if (league.status === 'Predraft') {
      const res = await fetch(`/api/leagues/${league.hash}/status`, { method: 'PUT' });
      if (res.status !== 200) {
        alert(`Failed to join draft: ${res.statusText}`);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ['league', league.hash] });
      await queryClient.invalidateQueries({ queryKey: ['settings', league.hash] });
    }
    router.push(`/leagues/${league.hash}/draft`);
  };

  return (
    <article className='flex flex-col w-full p-2 bg-card rounded-xl'>
      <span className='flex w-full items-start'>
        <div className='flex flex-wrap gap-x-2 items-baseline'>
          <h2 className='text-lg font-bold text-accent-foreground'>Draft Countdown</h2>
          <p className='text-sm text-muted-foreground'>
            {leagueSettings?.draftDate
              ? (leagueSettings.draftDate.getTime() > Date.now()
                ? `Starts at: ${leagueSettings.draftDate.toLocaleString()}`
                : (league?.status === 'Draft'
                  ? 'Draft is live!'
                  : 'Draft ready to start!'))
              : 'Draft set to manual start by commissioner'}
          </p>
        </div>
        <div className='flex gap-2 ml-auto'>
          {editable && leagueMembers && leagueMembers.members.length > 1 && league?.status === 'Predraft' &&
            <StartDraft startDraft={onDraftJoin} />}
          {editable && <SetDraftDate overrideHash={overrideHash} />}
        </div>
      </span>
      <span className='bg-primary rounded-lg p-2 mt-2 text-primary-foreground text-2xl shadow-sm shadow-black'>
        <Clock endDate={leagueSettings?.draftDate ?? null} replacedBy={
          <Button
            className='w-full p-2 rounded-xl text-sidebar-foreground text-2xl'
            variant='positive'
            disabled={!league || (leagueMembers?.loggedIn?.role !== 'Owner' && league?.status !== 'Draft')}
            onClick={onDraftJoin}>
            {league?.status === 'Draft' ? 'Join Draft' :
              (leagueMembers?.loggedIn?.role === 'Owner' ? 'Start Draft' : 'Waiting for Commissioner')}
          </Button>
        } />
      </span>
    </article>
  );
}
