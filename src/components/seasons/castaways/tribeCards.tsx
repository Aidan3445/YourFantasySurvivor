'use client';

import { type Tribe } from '~/types/tribes';
import ColorRow from '~/components/shared/colorRow';

interface TribeCardsProps {
  tribes: Tribe[];
}

export default function TribeCards({ tribes }: TribeCardsProps) {
  return (
    <section className='w-full bg-card p-4 rounded-lg shadow-lg shadow-primary/10 overflow-x-hidden flex flex-wrap items-center gap-2'>
      <span className='flex items-center gap-2 w-full'>
        <span className='h-5 w-0.5 bg-primary rounded-full' />
        <h2 className='text-xl font-black uppercase tracking-tight'>Tribes</h2>
      </span>
      <article className='flex gap-2 flex-wrap'>
        {tribes.map(tribe => (
          <ColorRow
            key={tribe.tribeId}
            color={tribe.tribeColor}
            className='w-min shrink-0 border-2 font-bold'>
            {tribe.tribeName}
          </ColorRow>
        ))}
      </article>
    </section>
  );
}
