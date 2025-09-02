import { useQuery } from '@tanstack/react-query';

/**
 * Fetches tribes timeline data from the API.
 * @param {number} seasonId - The season ID to get tribes timeline for.
 */
export default function useTribesTimeline(seasonId: number) {
  return useQuery<Record<number, Record<number, number[]>>>({
    queryKey: ['baseEvents', seasonId],
    queryFn: async () => {
      const res = await fetch(`/api/seasons/tribesTimeline?seasonId=${seasonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tribes timeline data');
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
