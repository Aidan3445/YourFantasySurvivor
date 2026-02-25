'use client';

import { type LeagueDetails } from '~/types/leagues';
import { useMemo } from 'react';
import ColorRow from '~/components/shared/colorRow';
import { cn } from '~/lib/utils';

interface ChooseLeagueProps {
  leagues: LeagueDetails[];
  selectedHash: string | null;
  onSelect: (_hash: string) => void;
}

export default function ChooseLeague({ leagues, selectedHash, onSelect }: ChooseLeagueProps) {
  const ownedInactiveByseason = useMemo(() => {
    const map: Record<string, LeagueDetails[]> = {};

    leagues.forEach((league) => {
      if (league.league.status === 'Inactive' && league.member.role === 'Owner') {
        const season = league.league.season;
        map[season] ??= [];
        map[season].push(league);
      }
    });

    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([season, seasonLeagues]) => ({ season, leagues: seasonLeagues }));
  }, [leagues]);

  if (ownedInactiveByseason.length === 0) {
    return (
      <div className='flex flex-col items-center py-8 text-muted-foreground'>
        <p className='text-xl'>No leagues available to clone.</p>
        <p className='mt-1 text-base'>You must be the owner of an inactive league.</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {ownedInactiveByseason.map(({ season, leagues: seasonLeagues }) => (
        <div key={season} className='rounded-lg border-2 border-primary/20 bg-card pb-2'>
          <div className='flex items-center gap-2 p-4'>
            <div className='h-full w-1 rounded-full bg-secondary' />
            <p className='text-lg font-black uppercase tracking-tight text-muted-foreground'>
              {season}
            </p>
          </div>
          <div className='space-y-2 px-2'>
            {seasonLeagues.map(({ league, member }) => (
              <button
                key={league.hash}
                type='button'
                onClick={() => onSelect(league.hash)}
                className={cn(
                  'w-full flex items-center justify-between rounded-lg border-2 p-3 text-left transition-colors cursor-pointer',
                  selectedHash === league.hash
                    ? 'border-primary bg-primary/10'
                    : 'border-primary/20 bg-primary/5 hover:bg-primary/10'
                )}>
                <div>
                  <p className='font-bold'>{league.name}</p>
                  <ColorRow
                    className='mt-1 inline-flex rounded px-2 py-0.5'
                    color={member.color}>
                    <span className='text-xs font-semibold' >
                      {member.displayName}
                    </span>
                  </ColorRow>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
