import { useQuery } from '@tanstack/react-query';
import { useIsEpisodeAiringForSeason } from '~/hooks/helpers/useIsEpisodeAiring';
import { useRefreshConfig } from '~/hooks/helpers/useRefreshConfig';

/**
  * Fetches tribe members data from the API.
  * @param {number} seasonId The season ID to get tribes timeline for.
  * @param {number} episodeNumber The episode number to get tribe members for.
  * @returnObj `Record<tribeId, castawayId[]>`
  */
export function useTribeMembers(seasonId: number | null, episodeNumber: number | null) {
  const isEpisodeAiring = useIsEpisodeAiringForSeason(seasonId ?? null);
  const refreshConfig = useRefreshConfig(isEpisodeAiring);

  return useQuery<Record<number, number[]>>({
    queryKey: ['tribeMembers', seasonId],
    queryFn: async () => {
      if (!seasonId || !episodeNumber) {
        return {};
      }

      const res = await fetch(`/api/seasons/tribeMembers?seasonId=${seasonId}&episodeNumber=${episodeNumber}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tribes timeline data');
      }
      const members = await res.json() as Record<number, number[]>;
      return members;
    },
    enabled: !!seasonId && !!episodeNumber,
    ...refreshConfig,
  });
}
