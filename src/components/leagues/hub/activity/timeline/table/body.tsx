'use client';

import { TableCell, TableRow } from '~/components/common/table';
import { type EpisodeEventsProps } from '~/components/leagues/hub/activity/timeline/table/view';
import { type EnrichedEvent, type EventWithReferences, type Prediction } from '~/types/events';
import { useEnrichEvents } from '~/hooks/seasons/enrich/useEnrichEvents';
import EventRow from '~/components/leagues/hub/activity/timeline/table/row';
import { useEnrichPredictions } from '~/hooks/seasons/enrich/useEnrichPredictions';
import PredictionRow from '~/components/leagues/hub/activity/timeline/table/row/predictionRow';

interface EpisodeEventsTableBodyProps extends EpisodeEventsProps {
  seasonId: number;
  filteredEvents: EventWithReferences[];
  filteredPredictions: Prediction[];
}

export default function EpisodeEventsTableBody({
  seasonId,
  episodeNumber,
  mockEvents,
  filteredEvents,
  filteredPredictions,
  edit,
  filters
}: EpisodeEventsTableBodyProps) {
  const enrichedEvents = useEnrichEvents(seasonId, filteredEvents);
  const enrichedMockEvents = useEnrichEvents(seasonId, mockEvents ?? null);
  const enrichedPredictions = useEnrichPredictions(seasonId, enrichedEvents, filteredPredictions);
  const enrichedMockPredictions = useEnrichPredictions(seasonId, enrichedMockEvents, filteredPredictions);

  const { baseEvents, customEvents } = enrichedEvents.reduce((acc, event) => {
    if (event.eventSource === 'Base') {
      acc.baseEvents.push(event);
    } else {
      acc.customEvents.push(event);
    }
    return acc;
  }, { baseEvents: [] as EnrichedEvent[], customEvents: [] as EnrichedEvent[] });

  if (!enrichedEvents.length && !enrichedPredictions.length && !mockEvents) {
    const hasFilters =
      filters.member.length > 0 ||
      filters.castaway.length > 0 ||
      filters.event.length > 0 ||
      filters.tribe.length > 0;

    return (
      <TableRow className='bg-card'>
        <TableCell colSpan={7} className='text-center text-muted-foreground'>
          No events for episode {episodeNumber} {hasFilters ? 'with the selected filters' : ''}
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {enrichedMockEvents.map((mock, index) =>
        <EventRow key={index} className='bg-yellow-500' event={mock} edit={false} />
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
        <EventRow key={index} event={event} edit={edit} />
      ))}
      {customEvents.length > 0 &&
        <TableRow className='bg-gray-100 hover:bg-gray-200'>
          <TableCell colSpan={7} className='text-xs text-muted-foreground'>
            Custom Events
          </TableCell>
        </TableRow>}
      {customEvents.map((event, index) => (
        <EventRow key={index} event={event} edit={edit} />
      ))}
      {enrichedPredictions.length + enrichedMockPredictions.length > 0 &&
        <TableRow className='bg-gray-100 hover:bg-gray-200'>
          <TableCell colSpan={7} className='text-xs text-muted-foreground'>
            Predictions
          </TableCell>
        </TableRow>}
      {enrichedMockPredictions.map((mock, index) =>
        <PredictionRow key={index} className='bg-yellow-500' prediction={mock} editCol={edit} />
      )}
      {enrichedPredictions.map((prediction, index) =>
        <PredictionRow key={index} prediction={prediction} editCol={edit} />
      )}
    </>
  );
}

