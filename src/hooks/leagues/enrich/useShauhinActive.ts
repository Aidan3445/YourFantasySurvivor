import { useKeyEpisodes } from '~/hooks/seasons/useKeyEpisodes';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import { useMemo } from 'react';

/**
  * Custom hook to determine if Shauhin mode is active in the league.
  * @param {string} overrideHash Optional hash to override the URL parameter.
  * @returnObj `isShauhinActive`
  */
export function useShauhinActive(overrideHash?: string) {
  const { data: league } = useLeague(overrideHash);
  const { data: rules } = useLeagueRules(overrideHash);
  const { data: keyEpisodes } = useKeyEpisodes(league?.seasonId ?? null);

  const shauhinActive = useMemo(() => {

    if (!league || !rules?.shauhinMode?.enabled || !keyEpisodes?.previousEpisode) return false;
    const prevEpisodeNumber = keyEpisodes.previousEpisode.episodeNumber;
    const mergeEpisodeNumber = keyEpisodes.mergeEpisode?.episodeNumber ?? null;

    if (league.status === 'Draft') return false;

    const setting = rules.shauhinMode.startWeek;
    switch (setting) {
      case 'After Premiere':
        return prevEpisodeNumber >= 1;
      case 'After Merge':
        return mergeEpisodeNumber !== null && prevEpisodeNumber >= mergeEpisodeNumber;
      case 'Before Finale':
        return keyEpisodes.nextEpisode?.isFinale;
      case 'Custom':
        return prevEpisodeNumber >= (rules.shauhinMode.customStartWeek ?? Infinity);
      default:
        return false;
    }
  }, [rules?.shauhinMode, keyEpisodes, league]);

  return shauhinActive;
}

