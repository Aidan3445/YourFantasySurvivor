'use client';

import { type SeasonsDataQuery } from '~/types/seasons';
import TribeCards from '~/components/seasons/castaways/tribeCards';
import CastawayGrid from '~/components/seasons/castaways/castawayGrid';

interface CastawaysViewProps {
  seasonData: SeasonsDataQuery;
}

export default function CastawaysView({ seasonData }: CastawaysViewProps) {
  const { castaways, tribes, tribesTimeline } = seasonData;

  // Filter out non-season castaways (Jeff Probst, etc.)
  const seasonCastaways = castaways.filter(c => c.seasonId !== null);

  return (
    <div className='w-full flex flex-col gap-4 mx-2 mb-12'>
      <TribeCards tribes={tribes} />
      <CastawayGrid
        castaways={seasonCastaways}
        tribesTimeline={tribesTimeline}
        tribes={tribes} />
    </div>
  );
}
