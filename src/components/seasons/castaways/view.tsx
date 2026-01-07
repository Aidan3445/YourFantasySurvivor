'use client';

import { type SeasonsDataQuery } from '~/types/seasons';
import TribeCards from './tribeCards';
import CastawayGrid from './castawayGrid';

interface CastawaysViewProps {
  seasonData: SeasonsDataQuery;
}

export default function CastawaysView({ seasonData }: CastawaysViewProps) {
  const { castaways, tribes, tribesTimeline } = seasonData;

  return (
    <div className='flex flex-col gap-4'>
      <TribeCards castaways={castaways} tribes={tribes} />
      <CastawayGrid
        castaways={castaways}
        tribesTimeline={tribesTimeline}
        tribes={tribes}
      />
    </div>
  );
}
