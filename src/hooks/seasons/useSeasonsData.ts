import { useQuery } from '@tanstack/react-query';
import { type SeasonsDataQuery } from '~/types/seasons';

/**
  * Fetches seasons data from the API.
  * @param {boolean} includeInactive Whether to include inactive seasons.
  * @returnObj `SeasonsDataQuery`
  */
export function useSeasonsData(includeInactive: boolean) {
  return useQuery<SeasonsDataQuery[]>({
    queryKey: ['baseEvents', 'seasons', includeInactive],
    queryFn: async () => {
      const res = await fetch(`/api/seasons/seasonsData?includeInactive=${includeInactive}`);
      if (!res.ok) {
        throw new Error('Failed to fetch season data');
      }
      const data = await res.json() as SeasonsDataQuery[];
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnReconnect: true,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const isAnyEpisodeAiring = data.some(seasonData =>
        seasonData.episodes.some(episode => episode.airStatus === 'Airing')
      );
      return isAnyEpisodeAiring ? 1000 * 60 : false; // 1 minute
    },
    enabled: true
  });
}
