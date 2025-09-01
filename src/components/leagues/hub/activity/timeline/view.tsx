/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
'use client';

import { useState } from 'react';
import { type BaseEventName, type CustomEventName } from '~/types/events';
import { type LeagueMemberDisplayName } from '~/types/leagueMembers';
import { type CastawayName } from '~/types/castaways';
import { type TribeName } from '~/types/tribes';
import TimelineFilters from '~/components/leagues/hub/activity/timeline/filters';
import EpisodeEvents from '~/components/leagues/hub/activity/timeline/table/view';

// TODO: add survivor streak to timeline

export default function Timeline() {
  const [filterCastaway, setFilterCastaway] = useState<CastawayName[]>([]);
  const [filterTribe, setFilterTribe] = useState<TribeName[]>([]);
  const [filterMember, setFilterMember] = useState<LeagueMemberDisplayName[]>([]);
  const [filterEvent, setFilterEvent] = useState<(BaseEventName | CustomEventName)[]>([]);

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
