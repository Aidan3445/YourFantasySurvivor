import { useQuery } from '@tanstack/react-query';
import { type Episode } from '~/types/episodes';

/**
  * Fetches episodes data from the API.
  * @param seasonId The ID of the season to fetch episodes for.
  * @returnObj `Episode[]`
  */
export function useEpisodes(seasonId: number | null) {
  return useQuery<Episode[]>({
    queryKey: ['episodes', seasonId],
    queryFn: async () => {
      if (!seasonId) throw new Error('Season ID is required');

      const res = await fetch(`/api/seasons/episodes?seasonId=${seasonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch episode data');
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnReconnect: true,
    enabled: !!seasonId
  });
}
