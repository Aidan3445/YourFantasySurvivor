import { useQuery } from '@tanstack/react-query';

/**
 * Fetches episodes data from the API.
 * @param {boolean} activeOnly - If true, fetches only active episodes.
 */
export default function useGetEpisodes(seasonId: number, mostRecentOnly: boolean) {
  return useQuery({
    queryKey: ['episodes', seasonId, mostRecentOnly],
    queryFn: async () => {
      const res = await fetch(`/api/seasons/episodes?seasonId=${seasonId}&mostRecentOnly=${mostRecentOnly}`);
      if (!res.ok) {
        throw new Error('Failed to fetch episode data');
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
