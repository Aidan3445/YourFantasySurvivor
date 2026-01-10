'use client';

import { type SeasonsDataQuery } from '~/types/seasons';
import TribeCards from '~/components/seasons/castaways/tribeCards';
import CastawayGrid from '~/components/seasons/castaways/castawayGrid';
import { type SelectionTimelines } from '~/types/leagues';
import { type LeagueMember } from '~/types/leagueMembers';

interface CastawaysViewProps {
  seasonData: SeasonsDataQuery;
  leagueData?: {
    selectionTimeline?: SelectionTimelines;
    leagueMembers?: {
      members: LeagueMember[];
    };
  };
}

export default function CastawaysView({ seasonData, leagueData }: CastawaysViewProps) {
  const { castaways, tribes, tribesTimeline } = seasonData;

  // Filter out non-season castaways (Jeff Probst, etc.)
  const seasonCastaways = castaways.filter(c => c.seasonId !== null);

  return (
    <div className='w-full flex flex-col gap-4 mx-2'>
      <TribeCards tribes={tribes} />
      <CastawayGrid
        castaways={seasonCastaways}
        tribesTimeline={tribesTimeline}
        tribes={tribes}
        leagueData={leagueData} />
    </div>
  );
}
