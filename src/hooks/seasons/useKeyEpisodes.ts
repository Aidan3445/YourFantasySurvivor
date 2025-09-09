import { useQuery } from '@tanstack/react-query';
import { type KeyEpisodes } from '~/types/episodes';

/**
  * Fetches episodes data from the API.
  * @param seasonId The ID of the season to fetch episodes for.
  * @returnObj `KeyEpisodes`
  */
export function useKeyEpisodes(seasonId: number | null) {
  return useQuery<KeyEpisodes>({
    queryKey: ['episodes', seasonId],
    queryFn: async () => {
      if (!seasonId) throw new Error('Season ID is required');

      const res = await fetch(`/api/seasons/episodes/key?seasonId=${seasonId}`);
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
