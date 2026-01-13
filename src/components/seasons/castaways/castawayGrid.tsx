'use client';

import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe, type TribesTimeline } from '~/types/tribes';
import CastawayCard from '~/components/seasons/castaways/castawayCard';
import { type SelectionTimelines } from '~/types/leagues';
import { type LeagueMember } from '~/types/leagueMembers';

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

export default function CastawayGrid({ castaways, tribesTimeline, tribes, leagueData }: CastawayGridProps) {
  const { selectionTimeline, leagueMembers } = leagueData ?? {};
  return (
    <section className='w-full bg-card rounded-lg p-4 shadow-lg shadow-primary/10'>
      <span className='flex items-center gap-2 mb-4'>
        <span className='h-5 w-0.5 bg-primary rounded-full' />
        <h2 className='text-xl font-black uppercase tracking-tight'>All Castaways</h2>
      </span>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
        {castaways.map((castaway) => (
          <CastawayCard
            key={castaway.castawayId}
            castaway={castaway}
            tribesTimeline={tribesTimeline}
            tribes={tribes}
            member={
              leagueMembers?.members.find(m =>
                selectionTimeline?.castawayMembers[castaway.castawayId]?.slice()?.pop() === m.memberId)
            } />
        ))}
      </div>
    </section>
  );
}
