import { useMemo } from 'react';
import { useKeyEpisodes } from '~/hooks/seasons/useKeyEpisodes';
import { useLeague } from '~/hooks/leagues/useLeague';

/**
 * Core hook to determine if an episode is airing for a specific season
 * @param {number | null} seasonId The season ID to check episodes for
 */
export function useIsEpisodeAiringForSeason(seasonId: number | null) {
  const { data: keyEpisodes } = useKeyEpisodes(seasonId);

  return useMemo(() => {
    return keyEpisodes?.previousEpisode?.airStatus === 'Airing' ||
      keyEpisodes?.nextEpisode?.airStatus === 'Airing';
  }, [keyEpisodes?.previousEpisode?.airStatus, keyEpisodes?.nextEpisode?.airStatus]);
}

/**
 * League-aware hook to determine if an episode is currently airing
 * Considers league status (inactive leagues never have airing episodes)
 * @param {string} overrideHash Optional hash to override the URL parameter.
 */
export function useIsEpisodeAiring(overrideHash?: string) {
  const { data: league } = useLeague(overrideHash);
  const seasonId = useMemo(() => {
    return league?.status === 'Inactive' ? null : (league?.seasonId ?? null);
  }, [league?.status, league?.seasonId]);

  return useIsEpisodeAiringForSeason(seasonId);
}
