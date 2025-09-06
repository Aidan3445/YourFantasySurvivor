'use client';

import { TableCell, TableRow } from '~/components/common/table';
import { type EpisodeEventsProps } from '~/components/leagues/hub/activity/timeline/table/view';
import { type EnrichedEvent, type EventWithReferences, type Prediction } from '~/types/events';
import { useEnrichEvents } from '~/hooks/seasons/enrich/useEnrichEvents';
import EventRow from '~/components/leagues/hub/activity/timeline/table/row';

interface EpisodeEventsTableBodyProps extends EpisodeEventsProps {
  seasonId: number;
  filteredEvents: EventWithReferences[];
  filteredPredictions: Prediction[];
}

export default function EpisodeEventsTableBody({
  labelRow,
  seasonId,
  episodeNumber,
  mockEvents,
  filteredEvents,
  filteredPredictions,
  edit,
  filters
}: EpisodeEventsTableBodyProps) {
  const enrichedEvents = useEnrichEvents(seasonId, filteredEvents);
  const enrichedMockEvents = useEnrichEvents(seasonId, mockEvents);

  const { baseEvents, customEvents } = enrichedEvents.reduce((acc, event) => {
    if (event.eventSource === 'Base') {
      acc.baseEvents.push(event);
    } else {
      acc.customEvents.push(event);
    }
    return acc;
  }, { baseEvents: [] as EnrichedEvent[], customEvents: [] as EnrichedEvent[] });

  if (!filteredEvents.length && !filteredPredictions.length && !mockEvents) {
    const hasFilters =
      filters.member.length > 0 ||
      filters.castaway.length > 0 ||
      filters.event.length > 0 ||
      filters.tribe.length > 0;

    return labelRow ? null : (
      <TableRow className='bg-card'>
        <TableCell colSpan={7} className='text-center text-muted-foreground'>
          No events for episode {episodeNumber} {hasFilters ? 'with the selected filters' : ''}
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {labelRow && // TODO: wrap in accordion
        <TableRow className='bg-secondary/50 hover:bg-secondary/25'>
          <TableCell colSpan={7} className='text-center font-bold text-secondary-foreground'>
            Episode {episodeNumber}
          </TableCell>
        </TableRow>}
      {enrichedMockEvents.map((mock, index) =>
        <EventRow
          key={index}
          className='bg-yellow-500'
          event={mock}
          edit={false} />
      )}
      {baseEvents.length > 0 &&
        <TableRow className='bg-gray-100 hover:bg-gray-200 text-xs text-muted-foreground'>
          {edit && <TableCell className='w-0'>
            Edit
          </TableCell>}
          <TableCell>
            Official Events
          </TableCell>
          <TableCell className='text-center'>
            Points
          </TableCell>
          <TableCell className='text-left'>
            Tribes
          </TableCell>
          <TableCell className='text-right'>
            Castaways
          </TableCell>
          <TableCell className='text-left'>
            Members
          </TableCell>
          <TableCell className='text-right'>
            Notes
          </TableCell>
        </TableRow>}
      {baseEvents.map((event, index) => (
        <EventRow
          key={index}
          event={event}
          edit={edit} />
      ))}
      {customEvents.length > 0 &&
        <TableRow className='bg-gray-100 hover:bg-gray-200'>
          <TableCell colSpan={7} className='text-xs text-muted-foreground'>
            Custom Events
          </TableCell>
        </TableRow>}
      {customEvents.map((event, index) => (
        <EventRow
          key={index}
          event={event}
          edit={edit} />
      ))}
      {/* Predictions 
      {combinedPredictions?.length > 0 &&
        <TableRow className='bg-gray-100 hover:bg-gray-200'>
          <TableCell colSpan={7} className='text-xs text-muted-foreground'>
            Predictions
          </TableCell>
        </TableRow>}
      {combinedPredictions?.map((event, index) => (
        <LeagueEventRow
          key={index}
          eventId={event.eventId}
          eventName={event.eventName}
          points={event.points}
          references={event.references}
          predictionMakers={event.predictionMakers}
          misses={event.misses}
          defaultOpenMisses={filters.member.length > 0}
          notes={event.notes}
          episodeNumber={episodeNumber}
          edit={edit} />
      ))}
      */}
    </>
  );
}

