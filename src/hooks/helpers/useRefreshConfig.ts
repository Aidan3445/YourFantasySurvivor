import { useMemo } from 'react';
import { useLeague } from '~/hooks/leagues/useLeague';

/**
 * Hook to get dynamic refresh configuration based on episode airing status
 * @param {boolean} isEpisodeAiring Whether an episode is currently airing
 */
export function useRefreshConfig(isEpisodeAiring: boolean, hash?: string) {
  const { data: league } = useLeague(hash);

  return useMemo(() => {
    if (league?.status === 'Predraft' || league?.status === 'Draft') {
      return {
        staleTime: 15 * 1000,      // 15 seconds
        refetchInterval: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        gcTime: 2 * 60 * 1000, // 5 minutes
      };
    }

    if (isEpisodeAiring) {
      return {
        staleTime: 30 * 1000,      // 30 seconds
        refetchInterval: 60 * 1000, // 1 minute
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        gcTime: 5 * 60 * 1000, // 5 minutes
      };
    } else {
      return {
        staleTime: 5 * 60 * 1000,    // 5 minutes
        refetchInterval: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        gcTime: 15 * 60 * 1000, // 15 minutes
      };
    }
  }, [isEpisodeAiring, league?.status]);
}

