import { useQuery } from '@tanstack/react-query';

/**
  * Fetches tribe members data from the API.
  * @param {number} seasonId The season ID to get tribes timeline for.
  * @param {number} episodeNumber The episode number to get tribe members for.
  * @returnObj `Record<tribeId, castawayId[]>`
  */
export function useTribeMembers(seasonId: number | null, episodeNumber: number | null) {
  return useQuery<Record<number, number[]>>({
    queryKey: ['tribeMembers', seasonId],
    queryFn: async () => {
      if (!seasonId || !episodeNumber) {
        throw new Error('seasonId and episodeNumber are required');
      }

      const res = await fetch(`/api/seasons/tribeMembers?seasonId=${seasonId}&episodeNumber=${episodeNumber}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tribes timeline data');
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnReconnect: true,
    enabled: !!seasonId && !!episodeNumber
  });
}
