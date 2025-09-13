import { useQuery } from '@tanstack/react-query';
import { type KeyEpisodes } from '~/types/episodes';

/**
  * Fetches key episodes data with aggressive refresh only during episode air windows.
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
          ? { ...keyEpisodes.nextEpisode, airDate: new Date(keyEpisodes.nextEpisode.airDate) }
          : null,
        previousEpisode: keyEpisodes.previousEpisode
          ? { ...keyEpisodes.previousEpisode, airDate: new Date(keyEpisodes.previousEpisode.airDate) }
          : null,
      };
    },
    staleTime: (query) => {
      return determineEpisodeRefreshConfig(query.state.data).staleTime;
    },
    refetchInterval: (query) => {
      return determineEpisodeRefreshConfig(query.state.data).refetchInterval as number | false;
    },
    refetchOnWindowFocus: (query) => {
      return determineEpisodeRefreshConfig(query.state.data).refetchOnWindowFocus;
    },
    refetchOnReconnect: (query) => {
      return determineEpisodeRefreshConfig(query.state.data).refetchOnReconnect;
    },
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: !!seasonId
  });
}

/**
 * Determines refresh configuration based on episode timing
 */
function determineEpisodeRefreshConfig(keyEpisodes: KeyEpisodes | undefined) {
  if (!keyEpisodes?.nextEpisode?.airDate || !keyEpisodes.nextEpisode.runtime) {
    return {
      staleTime: 2 * 60 * 60 * 1000, // 2 hours
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      inTransitionWindow: false
    };
  }

  const now = new Date();
  const episodeStart = keyEpisodes.nextEpisode.airDate;
  const episodeEnd = new Date(episodeStart.getTime() + (keyEpisodes.nextEpisode.runtime * 60 * 1000));

  // 10 minutes before start to 10 minutes after end
  const windowStart = new Date(episodeStart.getTime() - (10 * 60 * 1000));
  const windowEnd = new Date(episodeEnd.getTime() + (10 * 60 * 1000));

  const inTransitionWindow = now >= windowStart && now <= windowEnd;

  if (inTransitionWindow) {
    return {
      staleTime: 5 * 1000,        // 5 seconds
      refetchInterval: 10 * 1000, // 10 seconds  
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      inTransitionWindow: true
    };
  }

  return {
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    inTransitionWindow: false
  };
}

