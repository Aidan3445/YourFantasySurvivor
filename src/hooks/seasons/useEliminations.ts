import { useQuery } from '@tanstack/react-query';
import { type Elimination, type Eliminations } from '~/types/events';
import { useIsEpisodeAiringForSeason } from '~/hooks/helpers/useIsEpisodeAiring';
import { useRefreshConfig } from '~/hooks/helpers/useRefreshConfig';

/**
  * Fetches eliminations data from the API.
  * @param {number} seasonId The season ID to get eliminations for.
  * @returnObj `Eliminations`
  */
export function useEliminations(seasonId: number | null) {
  const isEpisodeAiring = useIsEpisodeAiringForSeason(seasonId);
  const refreshConfig = useRefreshConfig(isEpisodeAiring);

  return useQuery<Eliminations>({
    queryKey: ['eliminations', seasonId],
    queryFn: async () => {
      if (!seasonId) return [];

      const res = await fetch(`/api/seasons/eliminations?seasonId=${seasonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch eliminations data');
      }
      const { eliminations } = await res.json() as { eliminations: (Elimination[] | null)[] };
      return eliminations.map((elimination) => {
        if (elimination === null) return [];
        return elimination;
      });
    },
    enabled: !!seasonId,
    ...refreshConfig,
  });
}
