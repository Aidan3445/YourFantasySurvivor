import { useQuery } from '@tanstack/react-query';
import { type Tribe } from '~/types/tribes';

/**
  * Fetches tribes data from the API.
  * @param {number} seasonId The season ID to get tribes for.
  * @returnObj `Tribe[]`
  */
export function useTribes(seasonId: number | null) {
  return useQuery<Tribe[]>({
    queryKey: ['tribes', seasonId],
    queryFn: async () => {
      if (!seasonId) throw new Error('Season ID is required');

      const res = await fetch(`/api/seasons/tribes?seasonId=${seasonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tribes data');
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnReconnect: true,
    enabled: !!seasonId
  });
}
