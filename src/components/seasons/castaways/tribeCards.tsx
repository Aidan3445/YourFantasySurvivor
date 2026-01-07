'use client';

import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { useMemo } from 'react';

interface TribeCardsProps {
  castaways: EnrichedCastaway[];
  tribes: Tribe[];
}

export default function TribeCards({ castaways, tribes }: TribeCardsProps) {
  // Group castaways by their starting tribe
  const tribeGroups = useMemo(() => {
    const groups: Record<number, { tribe: Tribe; castaways: EnrichedCastaway[] }> = {};

    tribes.forEach(tribe => {
      groups[tribe.tribeId] = { tribe, castaways: [] };
    });

    castaways.forEach(castaway => {
      if (castaway.tribe) {
        // Find the matching tribe by name
        const matchingTribe = tribes.find(t => t.tribeName === castaway.tribe?.name);
        if (matchingTribe) {
          groups[matchingTribe.tribeId]?.castaways.push(castaway);
        }
      }
    });

    return Object.values(groups).filter(g => g.castaways.length > 0);
  }, [castaways, tribes]);

  return (
    <section className='w-full bg-card rounded-lg overflow-x-hidden'>
      <div className='p-4'>
        <h2 className='text-2xl font-semibold mb-2'>Tribes</h2>
      </div>
      <ScrollArea className='overflow-auto w-[calc(100vw-2rem)] md:w-full'>
        <article className='flex gap-4 p-4 pt-0 justify-start'>
          {tribeGroups.map(({ tribe, castaways }) => (
            <div
              key={tribe.tribeId}
              className='flex flex-col gap-2 bg-b2 rounded-lg p-3 min-w-56'
              style={{ border: `5px solid ${tribe.tribeColor}` }}>
              <h3 className='text-lg font-semibold'>{tribe.tribeName}</h3>
              <div className='flex flex-col gap-1'>
                {castaways.map((castaway) => (
                  <div
                    key={castaway.castawayId}
                    className='text-sm px-2 py-1 bg-accent rounded'>
                    {castaway.fullName}
                    {castaway.eliminatedEpisode && (
                      <span className='text-muted-foreground text-xs ml-1'>
                        (Ep {castaway.eliminatedEpisode})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </article>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>
    </section>
  );
}
