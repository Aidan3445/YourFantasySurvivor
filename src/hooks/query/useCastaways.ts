import { useQuery } from '@tanstack/react-query';
import { type Castaway } from '~/types/castaways';

/**
 * Fetches castaways data from the API.
 * @param {number} seasonId - The season ID to get castaways for.
 */
export default function useCastaways(seasonId: number) {
  return useQuery<Castaway[]>({
    queryKey: ['castaways', seasonId],
    queryFn: async () => {
      const res = await fetch(`/api/seasons/castaways?seasonId=${seasonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch castaways data');
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: !!seasonId
  });
}