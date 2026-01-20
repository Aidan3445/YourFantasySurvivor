import 'server-only';

import getTribesTimeline from '~/services/seasons/query/tribesTimeline';
import getEliminations from '~/services/seasons/query/eliminations';

/**
  * Get the tribe members of each tribe at a given episode
  * @param seasonId The season id
  * @param episodeId The episode id
  * @returns the castaways and tribes that are active for the selected episode
  * @returnsObj `Record<tribeId, castawayId[]>`
  */
export default async function getTribeMembers(seasonId: number, episodeNumber: number) {
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

    if (ep > 2) {
      const previousEliminations = eliminations[ep - 2];
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
