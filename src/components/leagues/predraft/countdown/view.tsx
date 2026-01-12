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
import { cn } from '~/lib/utils';
import { Calendar, Clock as ClockIcon, Zap } from 'lucide-react';
import { Badge } from '~/components/common/badge';

interface DraftCountdownProps {
  overrideHash?: string;
  className?: string;
}

export function DraftCountdown({ overrideHash, className }: DraftCountdownProps) {
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

  const isDraftLive = league?.status === 'Draft';
  const isDraftReady = leagueSettings?.draftDate && leagueSettings.draftDate.getTime() <= Date.now();
  const isScheduled = leagueSettings?.draftDate && leagueSettings.draftDate.getTime() > Date.now();

  return (
    <article className={cn('relative overflow-hidden rounded-lg border-2 transition-all', className)}>
      {/* Accent glow for live draft */}
      {isDraftLive && (
        <div className='absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl' />
      )}

      <div className='relative z-10 p-4'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='h-6 w-1 bg-primary rounded-full' />
            <h2 className='text-xl font-black uppercase tracking-tight leading-none'>
              Draft Status
            </h2>
            <div className='flex items-center gap-2'>
              {isDraftLive ? (
                <Badge className='bg-green-500/20 text-green-600 border-green-500/40 border-2 font-black text-xs'>
                  <Zap className='w-3 h-3 mr-1' />
                  LIVE NOW
                </Badge>
              ) : isDraftReady ? (
                <Badge className='bg-blue-500/20 text-blue-600 border-blue-500/40 border-2 font-black text-xs'>
                  <ClockIcon className='w-3 h-3 mr-1' />
                  READY
                </Badge>
              ) : isScheduled ? (
                <Badge className='bg-yellow-500/20 text-yellow-600 border-yellow-500/40 border-2 font-black text-xs'>
                  <Calendar className='w-3 h-3 mr-1' />
                  SCHEDULED
                </Badge>
              ) : (
                <Badge className='bg-primary/20 text-primary border-primary/40 border-2 font-black text-xs'>
                  <ClockIcon className='w-3 h-3 mr-1' />
                  MANUAL START
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-2'>
            {editable && leagueMembers && leagueMembers.members.length > 1 && league?.status === 'Predraft' &&
              <StartDraft startDraft={onDraftJoin} />}
            {editable && <SetDraftDate overrideHash={overrideHash} />}
          </div>
        </div>

        {/* Draft Date Info */}
        {leagueSettings?.draftDate && (
          <div className='text-sm font-medium text-muted-foreground'>
            {isScheduled ? (
              <div className='flex items-center gap-2'>
                <Calendar className='w-4 h-4 text-primary' />
                <span>Starts: {leagueSettings.draftDate.toLocaleString()}</span>
              </div>
            ) : (
              <div className='flex items-center gap-2 text-primary'>
                <Zap className='w-4 h-4' />
                <span className='font-bold'>{isDraftLive ? 'Draft is live!' : 'Draft ready to start!'}</span>
              </div>
            )}
          </div>
        )}

        {/* Countdown / Action */}
        <div className='mt-1 bg-primary/10 border-2 border-primary/30 rounded-lg overflow-hidden'>
          <Clock endDate={leagueSettings?.draftDate ?? null} replacedBy={
            <Button
              className='w-full py-6 rounded-none font-black text-xl uppercase tracking-wider shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]'
              variant='default'
              disabled={!league || (leagueMembers?.loggedIn?.role !== 'Owner' && league?.status !== 'Draft')}
              onClick={onDraftJoin}>
              {league?.status === 'Draft' ? (
                <span className='flex items-center gap-2'>
                  <Zap className='w-5 h-5' />
                  Join Draft
                </span>
              ) : leagueMembers?.loggedIn?.role === 'Owner' ? (
                <span className='flex items-center gap-2'>
                  <Zap className='w-5 h-5' />
                  Start Draft
                </span>
              ) : (
                'Waiting for Commissioner'
              )}
            </Button>
          } />
        </div>
      </div>
    </article>
  );
}
