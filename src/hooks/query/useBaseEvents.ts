import { useQuery } from '@tanstack/react-query';
import { type EventWithReferences } from '~/types/events';

/**
 * Fetches base events data from the API.
 * @param {number} seasonId - The season ID to get base events for.
 */
export default function useBaseEvents(seasonId: number) {
  return useQuery<Record<number, Record<number, EventWithReferences>>>({
    queryKey: ['baseEvents', seasonId],
    queryFn: async () => {
      const res = await fetch(`/api/seasons/baseEvents?seasonId=${seasonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch base events data');
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
