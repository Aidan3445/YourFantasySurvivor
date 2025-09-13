import { useQuery } from '@tanstack/react-query';
import { type Castaway } from '~/types/castaways';

/**
  * Fetches castaways data from the API.
  * Optimized for static data that rarely changes in the database.
  * @param {number} seasonId The season ID to get castaways for.
  * @returnObj `Castaway[]`
  */
export function useCastaways(seasonId: number | null) {
  return useQuery<Castaway[]>({
    queryKey: ['castaways', seasonId],
    queryFn: async () => {
      if (!seasonId) return [];

      const res = await fetch(`/api/seasons/castaways?seasonId=${seasonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch castaways data');
      }
      const { castaways } = await res.json() as { castaways: Castaway[] };
      return castaways;
    },
    staleTime: Infinity,
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!seasonId
  });
}
