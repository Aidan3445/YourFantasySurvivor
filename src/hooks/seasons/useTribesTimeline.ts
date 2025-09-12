import { useQuery } from '@tanstack/react-query';
import { type TribesTimeline } from '~/types/tribes';

/**
  * Fetches tribes timeline data from the API.
  * @param {number} seasonId The season ID to get tribes timeline for.
  * @returnObj `TribesTimeline`
  */
export function useTribesTimeline(seasonId: number | null) {
  return useQuery<TribesTimeline>({
    queryKey: ['tribesTimeline', seasonId],
    queryFn: async () => {
      if (!seasonId) return {};

      const res = await fetch(`/api/seasons/tribesTimeline?seasonId=${seasonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tribes timeline data');
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnReconnect: true,
    enabled: !!seasonId
  });
}
