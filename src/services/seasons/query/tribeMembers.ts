import 'server-only';

import { unstable_cache } from 'next/cache';
import getTribesTimeline from '~/services/seasons/query/tribesTimeline';
import getEliminations from '~/services/seasons/query/eliminations';

/**
  * Get the tribe members of each tribe at a given episode
  * @param seasonId The season id
  * @param episodeId The episode id
  * @returns the castaways and tribes that are active for the selected episode
  * @returnsObj `Record<tribeId, castawayId[]>`
  */
export default async function getTribeMembers(seasonId: number, episodeId: number) {
  return unstable_cache(
    async (sid: number, eid: number) => fetchTribeMembers(sid, eid),
    ['season-episodes'],
    {
      revalidate: 3600,
      tags: [
        'tribe-members',
        `episodes-${seasonId}`,
        'episodes',
        `castaways-${seasonId}`,
        'castaways',
        `tribes-${seasonId}`,
        'tribes'
      ]
    }
  )(seasonId, episodeId);
}

async function fetchTribeMembers(seasonId: number, episodeNumber: number) {
  const tribesTimelineReq = getTribesTimeline(seasonId);
  const eliminationsReq = getEliminations(seasonId);

  const [tribesTimeline, eliminations] = await Promise.all([tribesTimelineReq, eliminationsReq]);

  const currentTribes: Record<number, number[]> = {};
  const eliminatedCastaways = new Set<number>();

  for (let ep = 1; ep <= episodeNumber; ep++) {
    const tribeUpdates = tribesTimeline[ep];
    if (tribeUpdates) {
      Object.entries(tribeUpdates).forEach(([tribeId, castawayIds]) => {
        const tid = parseInt(tribeId);

        castawayIds.forEach(castawayId => {
          Object.keys(currentTribes).forEach(existingTribeId => {
            const etid = parseInt(existingTribeId);
            const index = currentTribes[etid]?.indexOf(castawayId);
            if (index !== undefined && index > -1) {
              currentTribes[etid]?.splice(index, 1);
            }
          });
        });

        currentTribes[tid] = castawayIds;
      });
    }

    if (ep > 1) {
      const previousEliminations = eliminations[ep - 1];
      if (previousEliminations) {
        previousEliminations.forEach(({ castawayId }) => {
          eliminatedCastaways.add(castawayId);

          Object.keys(currentTribes).forEach(tribeId => {
            const tid = parseInt(tribeId);
            const index = currentTribes[tid]?.indexOf(castawayId);
            if (index !== undefined && index > -1) {
              currentTribes[tid]?.splice(index, 1);
            }
          });
        });
      }
    }
  }

  Object.keys(currentTribes).forEach(tribeId => {
    const tid = parseInt(tribeId);
    if (currentTribes[tid]?.length === 0) {
      delete currentTribes[tid];
    }
  });

  return currentTribes;
}
