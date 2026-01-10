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
    <section className='w-full bg-card rounded-lg p-4'>
      <h2 className='text-2xl font-semibold mb-4'>All Castaways</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
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
