import { useQuery } from '@tanstack/react-query';
import { type KeyEpisodes } from '~/types/episodes';

/**
  * Fetches episodes data from the API.
  * @param seasonId The ID of the season to fetch episodes for.
  * @returnObj `KeyEpisodes`
  */
export function useKeyEpisodes(seasonId: number | null) {
  return useQuery<KeyEpisodes>({
    queryKey: ['episodes', seasonId, 'key'],
    queryFn: async () => {
      if (!seasonId) return {} as KeyEpisodes;

      const res = await fetch(`/api/seasons/episodes/key?seasonId=${seasonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch episode data');
      }
      const keyEpisodes = await res.json() as KeyEpisodes;

      return {
        mergeEpisode: keyEpisodes.mergeEpisode
          ? { ...keyEpisodes.mergeEpisode, airDate: new Date(keyEpisodes.mergeEpisode.airDate) }
          : null,
        nextEpisode: keyEpisodes.nextEpisode
          ?
          { ...keyEpisodes.nextEpisode, airDate: new Date(keyEpisodes.nextEpisode.airDate) }
          : null,
        previousEpisode: keyEpisodes.previousEpisode
          ? { ...keyEpisodes.previousEpisode, airDate: new Date(keyEpisodes.previousEpisode.airDate) }
          : null,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnReconnect: true,
    enabled: !!seasonId
  });
}
