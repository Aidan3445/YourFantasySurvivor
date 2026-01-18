'use client';

import { TableCell, TableRow } from '~/components/common/table';
import { type EventWithReferencesAndPredOnly, type EpisodeEventsProps, type PredictionAndPredOnly } from '~/components/shared/eventTimeline/table/view';
import { type EnrichedEvent } from '~/types/events';
import { useEnrichEvents } from '~/hooks/seasons/enrich/useEnrichEvents';
import { useEnrichPredictions } from '~/hooks/seasons/enrich/useEnrichPredictions';
import PredictionRow from '~/components/shared/eventTimeline/table/row/predictionRow';
import EventRow from '~/components/shared/eventTimeline/table/row/eventRow';
import { useMemo } from 'react';
import { type LeagueMember } from '~/types/leagueMembers';
import StreakRow from '~/components/shared/eventTimeline/table/row/streakRow';

interface EpisodeEventsTableBodyProps extends EpisodeEventsProps {
  seasonId: number;
  filteredEvents: EventWithReferencesAndPredOnly[];
  filteredPredictions: PredictionAndPredOnly[];
  predictionEnrichmentEvents?: EventWithReferencesAndPredOnly[];
  index: number;
  noMembers: boolean;
}

export default function EpisodeEventsTableBody({
  seasonData,
  leagueData,
  episodeNumber,
  mockEvents,
  filteredEvents,
  filteredPredictions,
  predictionEnrichmentEvents,
  edit,
  filters,
  index,
  noMembers
}: EpisodeEventsTableBodyProps) {
  const enrichedEvents = useEnrichEvents(seasonData, filteredEvents, leagueData);
  const enrichedMockEvents = useEnrichEvents(seasonData, mockEvents ?? [], leagueData);
  const enrichedEnrichmentEvents = useEnrichEvents(seasonData, predictionEnrichmentEvents ?? [], leagueData);

  const eventsForPredictionEnrichment = useMemo(() => [
    ...enrichedEvents,
    ...enrichedEnrichmentEvents,
  ], [enrichedEvents, enrichedEnrichmentEvents]);

  const enrichedPredictions = useEnrichPredictions(
    seasonData,
    eventsForPredictionEnrichment,
    filteredPredictions,
    leagueData
  );
  const enrichedMockPredictions = useEnrichPredictions(
    seasonData,
    enrichedMockEvents,
    filteredPredictions,
    leagueData
  );

  const { baseEvents, customEvents } = enrichedEvents.reduce((acc, event) => {
    if (event.eventSource === 'Base') {
      acc.baseEvents.push(event);
    } else if (event.eventType === 'Direct') {
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

  // Group members by their streak value for this episode
  const streakGroups = Object.entries(leagueData?.streaks ?? {}).reduce((acc, [memberId, episodeStreaks]) => {
    const streakValue = episodeStreaks[episodeNumber] ?? 0;
    if (streakValue > 0) {
      const mid = Number(memberId);
      const member = leagueData?.leagueMembers?.members.find(m => m.memberId === mid);
      if (member) {
        const streakPointValue = Math.min(streakValue, leagueData?.leagueSettings?.survivalCap ?? streakValue);
        acc[streakPointValue] ??= [];
        acc[streakPointValue].push(member);
      }
    }
    return acc;
  }, {} as Record<number, LeagueMember[]>);

  return (
    <>
      {enrichedMockEvents.map((mock, index) =>
        <EventRow key={index} className='bg-yellow-500' event={mock} editCol={edit} isMock noMembers={noMembers} />
      )}
      {index > 0 &&
        <TableRow className='bg-gray-100 hover:bg-gray-200 text-xs text-muted-foreground'>
          {edit && <TableCell className='w-0'>
            Edit
          </TableCell>}
          <TableCell className='text-nowrap'>
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
          {!noMembers && <TableCell className='text-left'>
            Members
          </TableCell>}
          <TableCell className='text-right'>
            Notes
          </TableCell>
        </TableRow>}
      {baseEvents
        .filter(event => !filteredEvents.some(fe => fe.eventId === event.eventId && fe.predOnly))
        .map((event, index) => (
          <EventRow key={index} event={event} editCol={edit} noMembers={noMembers} />
        ))}
      {customEvents.length > 0 &&
        <TableRow className='bg-gray-100 hover:bg-gray-200'>
          <TableCell colSpan={7} className='text-xs text-muted-foreground'>
            Custom Events
          </TableCell>
        </TableRow>}
      {customEvents
        .filter(event => !filteredEvents.some(fe => fe.eventId === event.eventId && fe.predOnly))
        .map((event, index) => (
          <EventRow key={index} event={event} editCol={edit} noMembers={noMembers} />
        ))}
      {enrichedPredictions.length + enrichedMockPredictions.length > 0 &&
        <TableRow className='bg-gray-100 hover:bg-gray-200'>
          <TableCell colSpan={7} className='text-xs text-muted-foreground'>
            Predictions
          </TableCell>
        </TableRow>}
      {enrichedMockPredictions.map((mock, index) =>
        <PredictionRow key={index} className='bg-yellow-500' prediction={mock} editCol={edit} noMembers={noMembers} />
      )}
      {enrichedPredictions.map((prediction, index) =>
        <PredictionRow
          key={index}
          prediction={prediction}
          editCol={edit}
          noMembers={noMembers}
          defaultOpenMisses={
            prediction.misses.some(miss =>
              filters.member.includes(miss.member.memberId)
              || (miss.reference?.type === 'Castaway' && filters.castaway.includes(miss.reference.id))
              || (miss.reference?.type === 'Tribe' && filters.tribe.includes(miss.reference.id))
            )
          } />
      )}
      {!edit && Object.keys(streakGroups).length > 0 && (
        <>
          <TableRow className='bg-gray-100 hover:bg-gray-200'>
            <TableCell colSpan={7} className='text-xs text-muted-foreground'>
              Survival Streaks
            </TableCell>
          </TableRow>
          {Object.entries(streakGroups)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([streakPointValue, members]) => (
              <StreakRow
                key={streakPointValue}
                streakPointValue={Number(streakPointValue)}
                members={members}
                streaksMap={leagueData!.streaks!}
                episodeNumber={episodeNumber} />
            ))}
        </>
      )}
    </>
  );
}

