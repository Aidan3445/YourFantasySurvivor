import { useQuery } from '@tanstack/react-query';
import { type Tribe } from '~/types/tribes';

/**
 * Fetches tribes data from the API.
 * @param {number} seasonId - The season ID to get tribes for.
 */
export default function useTribes(seasonId: number) {
  return useQuery<Tribe[]>({
    queryKey: ['tribes', seasonId],
    queryFn: async () => {
      const res = await fetch(`/api/seasons/tribes?seasonId=${seasonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tribes data');
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