'use client';

import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe, type TribesTimeline } from '~/types/tribes';
import CastawayCard from '~/components/seasons/castaways/castawayCard';

interface CastawayGridProps {
  castaways: EnrichedCastaway[];
  tribesTimeline: TribesTimeline;
  tribes: Tribe[];
}

export default function CastawayGrid({ castaways, tribesTimeline, tribes }: CastawayGridProps) {
  return (
    <section className='w-full bg-card rounded-lg p-4'>
      <h2 className='text-2xl font-semibold mb-4'>All Castaways</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2'>
        {castaways.map((castaway) => (
          <CastawayCard
            key={castaway.castawayId}
            castaway={castaway}
            tribesTimeline={tribesTimeline}
            tribes={tribes}
          />
        ))}
      </div>
    </section>
  );
}
