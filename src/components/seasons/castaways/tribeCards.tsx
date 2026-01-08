'use client';

import { type Tribe } from '~/types/tribes';
import ColorRow from '~/components/shared/colorRow';

interface TribeCardsProps {
  tribes: Tribe[];
}

export default function TribeCards({ tribes }: TribeCardsProps) {
  return (
    <section className='w-full bg-card p-4 rounded-lg overflow-x-hidden flex flex-wrap items-center gap-2 '>
      <h2 className='text-2xl font-semibold'>Tribes</h2>
      <article className='flex gap-4 flex-wrap'>
        {tribes.map(tribe => (
          <ColorRow
            key={tribe.tribeId}
            color={tribe.tribeColor}
            className='w-min shrink-0'>
            {tribe.tribeName}
          </ColorRow>
        ))}
      </article>
    </section>
  );
}
