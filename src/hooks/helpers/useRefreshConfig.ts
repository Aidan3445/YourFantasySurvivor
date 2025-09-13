import { useMemo } from 'react';

/**
 * Hook to get dynamic refresh configuration based on episode airing status
 * @param {boolean} isEpisodeAiring Whether an episode is currently airing
 */
export function useRefreshConfig(isEpisodeAiring: boolean) {
  return useMemo(() => {
    if (isEpisodeAiring) {
      return {
        staleTime: 30 * 1000,      // 30 seconds
        refetchInterval: 60 * 1000, // 1 minute
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      };
    } else {
      return {
        staleTime: 5 * 60 * 1000,    // 5 minutes
        refetchInterval: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      };
    }
  }, [isEpisodeAiring]);
}

