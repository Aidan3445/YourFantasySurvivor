import { useQuery } from '@tanstack/react-query';
import { type Events } from '~/types/events';
import { useIsEpisodeAiringForSeason } from '~/hooks/helpers/useIsEpisodeAiring';
import { useRefreshConfig } from '~/hooks/helpers/useRefreshConfig';

/**
  * Fetches base events data from the API.
  * @param {number} seasonId The season ID to get base events for.
  * @returnObj `Events`
  */
export function useBaseEvents(seasonId: number | null) {
  const isEpisodeAiring = useIsEpisodeAiringForSeason(seasonId);
  const refreshConfig = useRefreshConfig(isEpisodeAiring);

  return useQuery<Events>({
    queryKey: ['baseEvents', seasonId],
    queryFn: async () => {
      if (!seasonId) return {};

      const res = await fetch(`/api/seasons/baseEvents?seasonId=${seasonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch base events data');
      }
      return res.json();
    },
    enabled: !!seasonId,
    ...refreshConfig,
  });
}
