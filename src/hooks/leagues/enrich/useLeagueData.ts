import { useMemo } from 'react';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useSeasonsData } from '~/hooks/seasons/useSeasonsData';
import { useSelectionTimeline } from '~/hooks/leagues/useSelectionTimeline';
import { useCustomEvents } from '~/hooks/leagues/useCustomEvents';
import { useBasePredictions } from '~/hooks/leagues/useBasePredictions';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import { useLeagueSettings } from '~/hooks/leagues/useLeagueSettings';
import { compileScores } from '~/lib/scores';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';

/**
  * Fetch and manage league data including scores, members, seasons, and settings.
  * @param {string} overrideHash Optional hash to override the URL parameter.
  */
export function useLeagueData(overrideHash?: string) {
  const { data: league } = useLeague(overrideHash);
  const { data: leagueMembers } = useLeagueMembers(overrideHash);
  const { data: seasonsData } = useSeasonsData(false);
  const { data: selectionTimeline } = useSelectionTimeline(overrideHash);
  const { data: customEvents } = useCustomEvents(overrideHash);
  const { data: basePredictions } = useBasePredictions(overrideHash);
  const { data: leagueRules } = useLeagueRules(overrideHash);
  const { data: leagueSettings } = useLeagueSettings(overrideHash);

  const seasonData = useMemo(() =>
    seasonsData?.find((s) => s.season.seasonId === league?.seasonId),
    [seasonsData, league]);

  const scoreData = useMemo(() => {
    if (!league || !leagueMembers || !seasonData || !selectionTimeline || !basePredictions || !leagueRules || !leagueSettings) {
      return {
        scores: { Castaway: {}, Tribe: {}, Member: {} },
        currentStreaks: {},
        sortedMemberScores: [],
        loggedInIndex: -1,
      };
    }

    const { scores, currentStreaks } = compileScores(
      seasonData.baseEvents,
      seasonData.eliminations,
      seasonData.tribesTimeline,
      selectionTimeline,
      customEvents,
      basePredictions,
      leagueRules,
      leagueSettings.survivalCap,
      leagueSettings.preserveStreak
    );

    const sortedMemberScores = Object.entries(scores.Member)
      .sort(([_, scoresA], [__, scoresB]) =>
        (scoresB.slice().pop() ?? 0) - (scoresA.slice().pop() ?? 0))
      .map(([member, memberScores]) => ({
        member: leagueMembers.members.find((m) => m.memberId === Number(member))!,
        scores: memberScores,
        currentStreak: currentStreaks[Number(member)] ?? 0,
      }))
      .filter(({ member }) => member !== undefined);

    const loggedInIndex = sortedMemberScores.findIndex(({ member }) => member?.loggedIn);

    return {
      scores,
      currentStreaks,
      sortedMemberScores,
      loggedInIndex,
    };
  }, [
    league,
    leagueMembers,
    seasonData,
    selectionTimeline,
    customEvents,
    basePredictions,
    leagueRules,
    leagueSettings
  ]);

  return {
    ...scoreData,
    ...seasonData,
    league,
    leagueMembers,
    selectionTimeline,
    customEvents,
    basePredictions,
    leagueRules,
    leagueSettings
  };
}


