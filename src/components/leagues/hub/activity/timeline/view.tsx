'use client';

import { useState } from 'react';
import TimelineFilters from '~/components/leagues/hub/activity/timeline/filters';
import EpisodeEvents from '~/components/leagues/hub/activity/timeline/table/view';

// TODO: add survivor streak to timeline

export default function Timeline() {
  const [filterCastaway, setFilterCastaway] = useState<number[]>([]);
  const [filterTribe, setFilterTribe] = useState<number[]>([]);
  const [filterMember, setFilterMember] = useState<number[]>([]);
  const [filterEvent, setFilterEvent] = useState<string[]>([]);

  const [selectedEpisode, setSelectedEpisode] = useState<number>();

  return (
    <section className='w-full bg-card rounded-lg relative place-items-center'>
      <TimelineFilters
        filterCastaway={filterCastaway}
        setFilterCastaway={setFilterCastaway}
        filterTribe={filterTribe}
        setFilterTribe={setFilterTribe}
        filterMember={filterMember}
        setFilterMember={setFilterMember}
        filterEvent={filterEvent}
        setFilterEvent={setFilterEvent}
        selectedEpisode={selectedEpisode}
        setSelectedEpisode={setSelectedEpisode} />
      {selectedEpisode &&
        <EpisodeEvents
          episodeNumber={selectedEpisode}
          filters={{
            castaway: filterCastaway,
            tribe: filterTribe,
            member: filterMember,
            event: filterEvent
          }} />}
    </section >
  );
}
