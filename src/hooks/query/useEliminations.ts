import { useQuery } from '@tanstack/react-query';
import { type Elimination } from '~/types/events';

/**
 * Fetches eliminations data from the API.
 * @param {number} seasonId - The season ID to get eliminations for.
 */
export default function useEliminations(seasonId: number) {
  return useQuery<Record<number, Elimination[]>>({
    queryKey: ['eliminations', seasonId],
    queryFn: async () => {
      const res = await fetch(`/api/seasons/eliminations?seasonId=${seasonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch eliminations data');
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