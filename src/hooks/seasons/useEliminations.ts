import { useQuery } from '@tanstack/react-query';
import { type Eliminations } from '~/types/events';

/**
  * Fetches eliminations data from the API.
  * @param {number} seasonId The season ID to get eliminations for.
  * @returnObj `Eliminations`
  */
export function useEliminations(seasonId: number | null) {
  return useQuery<Eliminations>({
    queryKey: ['eliminations', seasonId],
    queryFn: async () => {
      if (!seasonId) throw new Error('Season ID is required');

      const res = await fetch(`/api/seasons/eliminations?seasonId=${seasonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch eliminations data');
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnReconnect: true,
    enabled: !!seasonId
  });
}
