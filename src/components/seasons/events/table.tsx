'use client';

import { Table, TableBody, TableHead, TableHeader, TableRow } from '~/components/common/table';
import { type Events } from '~/types/events';
import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';
import EventRow from './row';
import { useMemo } from 'react';

interface EventsTableProps {
  baseEvents: Events;
  castaways: EnrichedCastaway[];
  tribes: Tribe[];
  filterEpisode: number | null;
  filterCastaways: number[];
  filterTribes: number[];
  filterEventTypes: string[];
}

export default function EventsTable({
  baseEvents,
  castaways,
  tribes,
  filterEpisode,
  filterCastaways,
  filterTribes,
  filterEventTypes
}: EventsTableProps) {
  const filteredEvents = useMemo(() => {
    const allEvents = Object.entries(baseEvents).flatMap(([episodeNum, events]) =>
      Object.values(events).map(event => ({
        ...event,
        episodeNumber: Number(episodeNum)
      }))
    );

    return allEvents.filter(event => {
      // Episode filter
      if (filterEpisode !== null && filterEpisode !== -1 && event.episodeNumber !== filterEpisode) {
        return false;
      }

      // Castaway filter
      if (filterCastaways.length > 0) {
        const eventCastawayIds = event.references
          .filter(ref => ref.type === 'Castaway')
          .map(ref => ref.id);
        if (!eventCastawayIds.some(id => filterCastaways.includes(id))) {
          return false;
        }
      }

      // Tribe filter
      if (filterTribes.length > 0) {
        const eventTribeIds = event.references
          .filter(ref => ref.type === 'Tribe')
          .map(ref => ref.id);
        if (!eventTribeIds.some(id => filterTribes.includes(id))) {
          return false;
        }
      }

      // Event type filter
      if (filterEventTypes.length > 0) {
        if (!filterEventTypes.includes(event.eventName)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => a.episodeNumber - b.episodeNumber || a.eventId - b.eventId);
  }, [baseEvents, filterEpisode, filterCastaways, filterTribes, filterEventTypes]);

  return (
    <div className='bg-card rounded-lg p-4'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='text-center w-20'>Episode</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Tribe</TableHead>
            <TableHead>Castaway(s)</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <EventRow
                key={`${event.episodeNumber}-${event.eventId}`}
                event={event}
                castaways={castaways}
                tribes={tribes}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className='text-center text-muted-foreground'>
                No events match the selected filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
