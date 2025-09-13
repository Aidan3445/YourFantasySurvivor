import { useQuery } from '@tanstack/react-query';
import { type SeasonsDataQuery } from '~/types/seasons';

/**
  * Fetches seasons data from the API.
  * @param {boolean} includeInactive Whether to include inactive seasons.
  * @param {number} [seasonId] Optional season ID to fetch specific season data, overrides includeInactive
  * @returnObj `SeasonsDataQuery`
  */
export function useSeasonsData(includeInactive: boolean, seasonId?: number) {
  return useQuery<SeasonsDataQuery[]>({
    queryKey: ['seasons', seasonId, includeInactive],
    queryFn: async () => {
      const res = await fetch(`/api/seasons/seasonsData?includeInactive=${includeInactive}${seasonId ? `&seasonId=${seasonId}` : ''}`);
      if (!res.ok) {
        throw new Error('Failed to fetch season data');
      }
      const { seasonsData } = await res.json() as { seasonsData: SeasonsDataQuery[] };
      return seasonsData.map(seasonData => ({
        ...seasonData,
        // Convert date strings to Date objects
        season: {
          ...seasonData.season,
          premiereDate: new Date(seasonData.season.premiereDate),
          finaleDate: seasonData.season.finaleDate ? new Date(seasonData.season.finaleDate) : null,
        },
        episodes: seasonData.episodes.map(episode => ({
          ...episode,
          airDate: new Date(episode.airDate),
        })),
      }));
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
