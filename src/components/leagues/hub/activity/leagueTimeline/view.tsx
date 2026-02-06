'use client';

import EventTimeline from '~/components/shared/eventTimeline/view';
import { type SeasonsDataQuery } from '~/types/seasons';
import { useLeagueData } from '~/hooks/leagues/enrich/useLeagueData';

interface LeagueTimelineProps {
  initialSeasonData: SeasonsDataQuery;
}

/**
 * Wrapper component for EventTimeline that fetches league data.
 * Use this component on league routes where league context is available.
 * For non-league contexts (like seasons page), use EventTimeline directly.
 */
export default function LeagueTimeline({ initialSeasonData }: LeagueTimelineProps) {
  const data = useLeagueData();

  return (
    <EventTimeline
      seasonData={(data?.episodes ? data : initialSeasonData) as SeasonsDataQuery}
      leagueData={data} />
  );
}
