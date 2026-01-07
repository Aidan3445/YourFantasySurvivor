'use client';

import { useState } from 'react';
import { type SeasonsDataQuery } from '~/types/seasons';
import EventsFilters from './filters';
import EventsTable from './table';

interface EventsViewProps {
  seasonData: SeasonsDataQuery;
}

export default function EventsView({ seasonData }: EventsViewProps) {
  const { season, castaways, tribes, baseEvents } = seasonData;

  const [filterEpisode, setFilterEpisode] = useState<number | null>(null);
  const [filterCastaways, setFilterCastaways] = useState<number[]>([]);
  const [filterTribes, setFilterTribes] = useState<number[]>([]);
  const [filterEventTypes, setFilterEventTypes] = useState<string[]>([]);

  return (
    <div className='flex flex-col gap-4'>
      <EventsFilters
        seasonId={season.seasonId}
        castaways={castaways}
        tribes={tribes}
        setFilterEpisode={setFilterEpisode}
        setFilterCastaways={setFilterCastaways}
        setFilterTribes={setFilterTribes}
        setFilterEventTypes={setFilterEventTypes}
        filterEpisode={filterEpisode}
        filterCastaways={filterCastaways}
        filterTribes={filterTribes}
        filterEventTypes={filterEventTypes}
      />
      <EventsTable
        baseEvents={baseEvents}
        castaways={castaways}
        tribes={tribes}
        filterEpisode={filterEpisode}
        filterCastaways={filterCastaways}
        filterTribes={filterTribes}
        filterEventTypes={filterEventTypes}
      />
    </div>
  );
}
