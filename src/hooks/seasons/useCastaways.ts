import { useQuery } from '@tanstack/react-query';
import { type Castaway } from '~/types/castaways';

/**
  * Fetches castaways data from the API.
  * @param {number} seasonId The season ID to get castaways for.
  * @returnObj `Castaway[]`
  */
export function useCastaways(seasonId: number | null) {
  return useQuery<Castaway[]>({
    queryKey: ['castaways', seasonId],
    queryFn: async () => {
      if (!seasonId) throw new Error('Season ID is required');

      const res = await fetch(`/api/seasons/castaways?seasonId=${seasonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch castaways data');
      }
      const { castaways } = await res.json() as { castaways: Castaway[] };
      return castaways;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnReconnect: true,
    enabled: !!seasonId
  });
}
