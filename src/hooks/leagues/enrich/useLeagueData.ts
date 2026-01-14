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
  const { data: seasonsData } = useSeasonsData(true, league?.seasonId);
  const { data: selectionTimeline } = useSelectionTimeline(overrideHash);
  const { data: customEvents } = useCustomEvents(overrideHash);
  const { data: basePredictions } = useBasePredictions(overrideHash);
  const { data: leagueRules } = useLeagueRules(overrideHash);
  const { data: leagueSettings } = useLeagueSettings(overrideHash);

  const seasonData = useMemo(() =>
    seasonsData?.find((s) => s.season.seasonId === league?.seasonId),
    [seasonsData, league?.seasonId]
  );

  const membersArray = useMemo(() => leagueMembers?.members ?? [], [leagueMembers?.members]);

  const scoreData = useMemo(() => {
    console.time(`Score Compilation ${league?.hash ?? overrideHash ?? ''}`);
    if (!league || !membersArray.length || !seasonData || !selectionTimeline ||
      !basePredictions || !leagueRules || !leagueSettings) {
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
      seasonData.keyEpisodes,
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
      .map(([memberId, memberScores]) => {
        const member = membersArray.find((m) => m.memberId === Number(memberId));
        return member ? {
          member,
          scores: memberScores,
          currentStreak: currentStreaks[Number(memberId)] ?? 0,
        } : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const loggedInIndex = sortedMemberScores.findIndex(({ member }) => member?.loggedIn);

    console.timeEnd(`Score Compilation ${league?.hash ?? overrideHash ?? ''}`);
    return {
      scores,
      currentStreaks,
      sortedMemberScores,
      loggedInIndex,
    };
  }, [
    league, membersArray, seasonData, selectionTimeline,
    basePredictions, leagueRules, leagueSettings, customEvents
  ]);

  return useMemo(() => ({
    ...scoreData,
    ...seasonData,
    league,
    leagueMembers,
    selectionTimeline,
    customEvents,
    basePredictions,
    leagueRules,
    leagueSettings
  }), [
    scoreData,
    seasonData,
    league,
    leagueMembers,
    selectionTimeline,
    customEvents,
    basePredictions,
    leagueRules,
    leagueSettings
  ]);
}
