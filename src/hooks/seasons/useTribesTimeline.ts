import { useQuery } from '@tanstack/react-query';
import { type TribesTimeline } from '~/types/tribes';
import { useRefreshConfig } from '~/hooks/helpers/useRefreshConfig';
import { useIsEpisodeAiringForSeason } from '~/hooks/helpers/useIsEpisodeAiring';

/**
  * Fetches tribes timeline data from the API.
  * @param {number} seasonId The season ID to get tribes timeline for.
  * @returnObj `TribesTimeline`
  */
export function useTribesTimeline(seasonId: number | null) {
  const isEpisodeAiring = useIsEpisodeAiringForSeason(seasonId ?? null);
  const refreshConfig = useRefreshConfig(isEpisodeAiring);

  return useQuery<TribesTimeline>({
    queryKey: ['tribesTimeline', seasonId],
    queryFn: async () => {
      if (!seasonId) return {};

      const res = await fetch(`/api/seasons/tribesTimeline?seasonId=${seasonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tribes timeline data');
      }
      return res.json() as Promise<TribesTimeline>;
    },
    enabled: !!seasonId,
    ...refreshConfig,
  });
}
