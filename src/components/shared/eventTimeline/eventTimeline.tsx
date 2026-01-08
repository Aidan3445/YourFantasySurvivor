'use client';

import { useState, useMemo } from 'react';
import TimelineFilters from '~/components/shared/eventTimeline/filters';
import EpisodeEvents from '~/components/shared/eventTimeline/table/view';
import { type SeasonsDataQuery } from '~/types/seasons';

// TODO: add survivor streak to event timeline

interface EventTimelineProps {
  seasonData: SeasonsDataQuery;
  hideMemberFilter?: boolean;
}

export default function EventTimeline({ seasonData, hideMemberFilter = false }: EventTimelineProps) {
  const [filterCastaway, setFilterCastaway] = useState<number[]>([]);
  const [filterTribe, setFilterTribe] = useState<number[]>([]);
  const [filterMember, setFilterMember] = useState<number[]>([]);
  const [filterEvent, setFilterEvent] = useState<string[]>([]);

  const [selectedEpisode, setSelectedEpisode] = useState<number>();

  const seasonDataWithDates = useMemo(() => {
    // Convert date strings back to Date objects after crossing server/client boundary
    // if dates are already Date objects, return as is. One date check is sufficient
    if (seasonData.season.premiereDate instanceof Date) {
      return seasonData;
    }

    return {
      ...seasonData,
      episodes: seasonData.episodes.map(ep => ({
        ...ep,
        airDate: new Date(ep.airDate)
      })),
      season: {
        ...seasonData.season,
        premiereDate: new Date(seasonData.season.premiereDate),
        finaleDate: seasonData.season.finaleDate ? new Date(seasonData.season.finaleDate) : null
      }
    };
  }, [seasonData]);

  return (
    <section className='w-full bg-card rounded-lg relative place-items-center'>
      <TimelineFilters
        seasonData={seasonDataWithDates}
        filterCastaway={filterCastaway}
        setFilterCastaway={setFilterCastaway}
        filterTribe={filterTribe}
        setFilterTribe={setFilterTribe}
        filterMember={filterMember}
        setFilterMember={setFilterMember}
        filterEvent={filterEvent}
        setFilterEvent={setFilterEvent}
        selectedEpisode={selectedEpisode}
        setSelectedEpisode={setSelectedEpisode}
        hideMemberFilter={hideMemberFilter} />
      {selectedEpisode &&
        <EpisodeEvents
          episodeNumber={selectedEpisode}
          seasonData={seasonDataWithDates}
          filters={{
            castaway: filterCastaway,
            tribe: filterTribe,
            member: filterMember,
            event: filterEvent
          }} />}
    </section >
  );
}
