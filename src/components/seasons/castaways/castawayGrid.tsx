'use client';

import { useMemo, useState } from 'react';
import { ArrowDownAZ, TreePalm } from 'lucide-react';

import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe, type TribesTimeline } from '~/types/tribes';
import CastawayCard from '~/components/seasons/castaways/castawayCard';
import { type SelectionTimelines } from '~/types/leagues';
import { type LeagueMember } from '~/types/leagueMembers';
import { Button } from '~/components/common/button';

interface CastawayGridProps {
  castaways: EnrichedCastaway[];
  tribesTimeline: TribesTimeline;
  tribes: Tribe[];
  leagueData?: {
    selectionTimeline?: SelectionTimelines;
    leagueMembers?: {
      members: LeagueMember[];
    };
  };
}

type SortMode = 'alpha' | 'tribe';

export default function CastawayGrid({
  castaways,
  tribesTimeline,
  tribes,
  leagueData,
}: CastawayGridProps) {
  const { selectionTimeline, leagueMembers } = leagueData ?? {};
  const [sortMode, setSortMode] = useState<SortMode>('alpha');

  const tribeOrder = useMemo(
    () => new Map(tribes.map((t, i) => [t.tribeName, i])),
    [tribes]
  );

  const sortedCastaways = useMemo(() => {
    if (sortMode === 'alpha') {
      return castaways;
    }

    return [...castaways].sort((a, b) => {
      const aTribe = a.tribe?.name ?? 'Unassigned';
      const bTribe = b.tribe?.name ?? 'Unassigned';

      const aIndex = tribeOrder.get(aTribe) ?? Number.MAX_SAFE_INTEGER;
      const bIndex = tribeOrder.get(bTribe) ?? Number.MAX_SAFE_INTEGER;

      return aIndex - bIndex;
    });
  }, [castaways, sortMode, tribeOrder]);

  return (
    <section className='w-full bg-card rounded-lg p-4 shadow-lg shadow-primary/10'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <span className='h-5 w-0.5 bg-primary rounded-full' />
          <h2 className='text-xl font-black uppercase tracking-tight'>
            All Castaways
          </h2>
        </div>

        <Button
          type='button'
          variant='outline'
          onClick={() =>
            setSortMode(m => (m === 'alpha' ? 'tribe' : 'alpha'))
          }
          className='p-2'
          aria-label='Toggle castaway sort'>
          {sortMode === 'alpha' ? (
            <ArrowDownAZ className='h-5 w-5' />
          ) : (
            <TreePalm className='h-5 w-5' />
          )}
        </Button>
      </div>

      {/* Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
        {sortedCastaways.map((castaway) => (
          <CastawayCard
            key={castaway.castawayId}
            castaway={castaway}
            tribesTimeline={tribesTimeline}
            tribes={tribes}
            member={leagueMembers?.members.find(
              m =>
                selectionTimeline?.castawayMembers[castaway.castawayId]
                  ?.slice()
                  ?.pop() === m.memberId
            )} />
        ))}
      </div>
    </section>
  );
}
