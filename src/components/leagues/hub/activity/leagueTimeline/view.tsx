'use client';

import { useMemo } from 'react';
import EventTimeline from '~/components/shared/eventTimeline/view';
import { type SeasonsDataQuery } from '~/types/seasons';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useSelectionTimeline } from '~/hooks/leagues/useSelectionTimeline';
import { useCustomEvents } from '~/hooks/leagues/useCustomEvents';
import { useBasePredictions } from '~/hooks/leagues/useBasePredictions';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import type { LeagueData } from '~/components/shared/eventTimeline/filters';
import { useSeasonsData } from '~/hooks/seasons/useSeasonsData';

interface LeagueTimelineProps {
  initialSeasonData: SeasonsDataQuery;
  hideMemberFilter?: boolean;
}

/**
 * Wrapper component for EventTimeline that fetches league data.
 * Use this component on league routes where league context is available.
 * For non-league contexts (like seasons page), use EventTimeline directly.
 */
export default function LeagueTimeline({ initialSeasonData, hideMemberFilter = false }: LeagueTimelineProps) {
  // Fetch all league data at this level to avoid nested delays
  const { data: league } = useLeague();
  const { data: selectionTimeline } = useSelectionTimeline();
  const { data: customEvents } = useCustomEvents();
  const { data: basePredictions } = useBasePredictions();
  const { data: leagueRules } = useLeagueRules();
  const { data: leagueMembers } = useLeagueMembers();
  const { data: fetchedSeasonData } = useSeasonsData(true, league?.seasonId);

  const leagueData: LeagueData = useMemo(() => ({
    league,
    selectionTimeline,
    customEvents,
    basePredictions,
    leagueRules,
    leagueMembers
  }), [league, selectionTimeline, customEvents, basePredictions, leagueRules, leagueMembers]);


  const seasonData = useMemo(() => {
    return fetchedSeasonData?.[0] ?? initialSeasonData;
  }, [fetchedSeasonData, initialSeasonData]);

  return (
    <EventTimeline
      seasonData={seasonData}
      leagueData={leagueData}
      hideMemberFilter={hideMemberFilter} />
  );
}
