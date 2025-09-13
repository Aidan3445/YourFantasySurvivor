import { useMemo } from 'react';
import { useCastaways } from '~/hooks/seasons/useCastaways';
import { useTribeMembers } from '~/hooks/seasons/useTribeMembers';
import { useTribes } from '~/hooks/seasons/useTribes';
import { type Castaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';

/**
  * Custom hook to get enriched tribe members data.
  * Combines tribe members with their respective tribe and castaway details.
  * @param {number} seasonId The season ID to get tribe members for.
  * @param {number} episode The episode number to get tribe members for.
  * @returnObj `Record<tribeId, { tribe: Tribe; castaways: Castaway[] }>`
  */
export function useEnrichedTribeMembers(seasonId: number | null, episode: number | null) {
  const { data: tribeMembers } = useTribeMembers(seasonId, episode);
  const { data: tribes } = useTribes(seasonId);
  const { data: castaways } = useCastaways(seasonId);

  return useMemo(() => {
    if (!tribeMembers || !tribes || !castaways) return {};

    const result: Record<number, { tribe: Tribe; castaways: Castaway[] }> = {};

    for (const [tribeId, memberIds] of Object.entries(tribeMembers)) {
      const tribe = tribes.find(t => t.tribeId === parseInt(tribeId));
      if (!tribe) continue;

      const members: Castaway[] = [];
      for (const id of memberIds) {
        const castaway = castaways.find(c => c.castawayId === id);
        if (castaway) {
          members.push(castaway);
        }
      }

      if (members.length > 0) {
        result[parseInt(tribeId)] = {
          tribe,
          castaways: members
        };
      }
    }

    return result;
  }, [tribeMembers, tribes, castaways]);
}
