'use client';

import { Fragment, useMemo } from 'react';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/common/table';
import EpisodeEventsTableBody from '~/components/leagues/hub/activity/timeline/table/body';
import { useBasePredictions } from '~/hooks/leagues/useBasePredictions';
import { useCustomEvents } from '~/hooks/leagues/useCustomEvents';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useSelectionTimeline } from '~/hooks/leagues/useSelectionTimeline';
import { useBaseEvents } from '~/hooks/seasons/useBaseEvents';
import { useEliminations } from '~/hooks/seasons/useEliminations';
import { useEpisodes } from '~/hooks/seasons/useEpisodes';
import { useTribesTimeline } from '~/hooks/seasons/useTribesTimeline';
import { findTribeCastaways } from '~/lib/utils';
import { type Prediction, type EventWithReferences } from '~/types/events';


export interface EpisodeEventsProps {
  episodeNumber: number;
  mockEvents?: EventWithReferences[];
  edit?: boolean;
  filters: {
    castaway: number[];
    tribe: number[];
    member: number[];
    event: string[];
  };
}

export type EventWithReferencesAndPredOnly = EventWithReferences & {
  predOnly?: boolean;
};

export type PredictionAndPredOnly = Prediction & {
  predOnly?: boolean;
};

export default function EpisodeEvents(
  { episodeNumber, mockEvents, edit, filters }: EpisodeEventsProps
) {
  const { data: league } = useLeague();
  const { data: selectionTimeline } = useSelectionTimeline();
  const { data: customEvents } = useCustomEvents();
  const { data: basePredictions } = useBasePredictions();
  const { data: baseEvents } = useBaseEvents(league?.seasonId ?? null);
  const { data: episodes } = useEpisodes(league?.seasonId ?? null);
  const { data: tribeTimeline } = useTribesTimeline(league?.seasonId ?? null);
  const { data: eliminations } = useEliminations(league?.seasonId ?? null);

  /*
  console.log({
    customEvents,
    basePredictions,
    baseEvents
  });
  */

  // All events for lookup purposes (needed to validate predictions reference valid events)
  const allEvents = useMemo(() => {
    const events: Record<number, EventWithReferences[]> = {};
    (episodes ?? []).forEach((episode) => {
      events[episode.episodeNumber] = [
        ...(baseEvents?.[episode.episodeNumber]
          ? Object.values(baseEvents[episode.episodeNumber]!) : []),
        ...(customEvents?.events?.[episode.episodeNumber]
          ? Object.values(customEvents.events[episode.episodeNumber]!) : [])
      ];
    });
    return events;
  }, [baseEvents, customEvents, episodes]);

  const combinedEvents = useMemo(() => {
    if (episodeNumber === -1) {
      return allEvents;
    }

    return { [episodeNumber]: allEvents[episodeNumber] ?? [] };
  }, [allEvents, episodeNumber]);

  const { combinedPredictions, enrichmentOnlyEvents } = useMemo(() => {
    const predictions: Record<number, Prediction[]> = {};
    const enrichmentEvents: EventWithReferences[] = [];

    if (episodeNumber === -1) {
      (episodes ?? []).forEach((episode) => {
        predictions[episode.episodeNumber] = [
          ...(basePredictions?.[episode.episodeNumber]
            ? Object.values(basePredictions[episode.episodeNumber]!).flat() : []),
          ...(customEvents?.predictions?.[episode.episodeNumber]
            ? Object.values(customEvents.predictions[episode.episodeNumber]!).flat() : []),
        ].filter((prediction) => {
          const eventEpNum = prediction.eventEpisodeNumber;
          if (!eventEpNum) return false;
          // Use allEvents to look up the event in its actual episode
          return allEvents[eventEpNum]?.some((event) => event.eventName === prediction.eventName);
        });
      });
    } else {
      predictions[episodeNumber] = [
        ...(basePredictions?.[episodeNumber] ? Object.values(basePredictions[episodeNumber]).flat() : []),
        ...(customEvents?.predictions?.[episodeNumber] ? Object.values(customEvents.predictions[episodeNumber]).flat() : []),
      ].filter((prediction) => {
        const eventEpNum = prediction.eventEpisodeNumber;
        if (!eventEpNum) return false;

        const matchingEvent = allEvents[eventEpNum]?.find(
          (event) => event.eventName === prediction.eventName
        );

        if (matchingEvent) {
          // If the event is from a different episode, add it to enrichment only
          if (eventEpNum !== episodeNumber) {
            // Avoid duplicates
            if (!enrichmentEvents.some(e => e.eventId === matchingEvent.eventId)) {
              enrichmentEvents.push(matchingEvent);
            }
          }
          return true;
        }
        return false;
      });
    }
    return { combinedPredictions: predictions, enrichmentOnlyEvents: enrichmentEvents };
  }, [basePredictions, customEvents, allEvents, episodeNumber, episodes]);

  // filter predictions first because they may require an event that gets filtered out
  const filteredPredictions = useMemo(() => {
    const filtered: Record<number, PredictionAndPredOnly[] | undefined> = {};
    Object.keys(combinedPredictions).forEach((key) => {
      const numKey = Number(key);
      filtered[numKey] = combinedPredictions[numKey]?.filter((prediction) => {
        const castawayMatch = filters.castaway.length === 0 || (
          prediction.referenceType === 'Castaway' && filters.castaway.includes(prediction.referenceId)
        );
        const tribeMatch = filters.tribe.length === 0 || (
          prediction.referenceType === 'Tribe' && filters.tribe.includes(prediction.referenceId)
        );
        const memberMatch = filters.member.length === 0 ||
          filters.member.includes(prediction.predictionMakerId);
        const eventMatch = filters.event.length === 0 || combinedEvents[numKey]?.some((event) =>
          event.eventName === prediction.eventName && filters.event.includes(event.eventName));

        return castawayMatch && tribeMatch && memberMatch && eventMatch;
      });
    });
    return filtered;
  }, [
    combinedEvents,
    combinedPredictions,
    filters.castaway,
    filters.event,
    filters.member,
    filters.tribe,
  ]);

  const filteredEvents = useMemo(() => {
    const filtered: Record<number, EventWithReferencesAndPredOnly[] | undefined> = {};
    Object.keys(combinedEvents).forEach((key) => {
      const numKey = Number(key);
      filtered[numKey] = combinedEvents[numKey]?.filter((event: EventWithReferencesAndPredOnly) => {
        const castawayMembers = selectionTimeline?.castawayMembers;
        const eventMembers = event.references.flatMap((ref) => {
          if (ref.type === 'Castaway') {
            const data = castawayMembers?.[ref.id];
            return data?.[numKey] ?? data?.[data.length - 1] ?? [];
          }

          return findTribeCastaways(tribeTimeline ?? {}, eliminations ?? [], ref.id, numKey)
            .flatMap((cid) => {
              const data = castawayMembers?.[cid];
              return data?.[numKey] ?? data?.[data.length - 1] ?? [];
            });
        });

        const castawayMatch = filters.castaway.length === 0 || event.references.some((ref) =>
          ref.type === 'Castaway' && filters.castaway.includes(ref.id));
        const tribeMatch = filters.tribe.length === 0 || event.references.some((ref) =>
          ref.type === 'Tribe' && filters.tribe.includes(ref.id));
        const memberMatch = filters.member.length === 0 || eventMembers.some((ref) =>
          filters.member.includes(ref));
        const eventMatch = filters.event.length === 0 || filters.event.includes(event.eventName);

        const keep = castawayMatch && tribeMatch && memberMatch && eventMatch;

        // if we're not keeping the event from filters, check if any predictions for it exist
        const matchPredictions = filteredPredictions[numKey]?.filter((prediction) =>
          prediction.eventId === event.eventId);
        if (!keep && matchPredictions && matchPredictions.length > 0) {
          event.predOnly = true;

          filteredPredictions[numKey] = filteredPredictions[numKey]?.map((prediction) => {
            if (prediction.eventId === event.eventId) {
              prediction.predOnly = true;
            }
            return prediction;
          });
        }

        return keep || event.predOnly;
      });
    });
    return filtered;
  }, [
    combinedEvents,
    eliminations,
    filteredPredictions,
    filters.castaway,
    filters.event,
    filters.member,
    filters.tribe,
    selectionTimeline?.castawayMembers,
    tribeTimeline
  ]);

  const noTribes = useMemo(() =>
    episodeNumber !== -1 && (
      !combinedEvents[episodeNumber]?.some((event) => event.references.some((ref) => ref.type === 'Tribe'))
      && !combinedPredictions[episodeNumber]?.some((prediction) => prediction.referenceType === 'Tribe')
      && !mockEvents?.some((event) => event.references.some((ref) => ref.type === 'Tribe'))
    ), [combinedEvents, combinedPredictions, episodeNumber, mockEvents]);

  return (
    <ScrollArea className='w-[calc(100svw-2.5rem)] md:w-[calc(100svw-var(--sidebar-width)-3rem)] lg:w-full bg-card rounded-lg gap-0'>
      <Table className='w-full'>
        <TableCaption className='sr-only'>Events from the previous episode</TableCaption>
        <TableHeader className='sticky top-0'>
          <TableRow className='bg-white hover:bg-white px-4 gap-4 rounded-md items-center text-nowrap'>
            {edit && <TableHead className='w-0'>
              Edit
            </TableHead>}
            <TableHead>Event</TableHead>
            <TableHead className='text-center'>Points</TableHead>
            <TableHead>{noTribes ? null : 'Tribes'}</TableHead>
            <TableHead className='text-right'>Castaways</TableHead>
            <TableHead className='w-full'>Members</TableHead>
            <TableHead className='text-right'>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {episodes?.filter((episode) =>
            episodeNumber === -1 || episode.episodeNumber === episodeNumber)
            .map((episode, index) => (
              <Fragment key={`timeline-${episode.episodeNumber}`}>
                {episodeNumber === -1 &&
                  <TableRow className='bg-secondary/50 hover:bg-secondary/25'>
                    <TableCell colSpan={7} className='text-center font-bold text-secondary-foreground'>
                      Episode {episode.episodeNumber}: {episode.title}
                    </TableCell>
                  </TableRow>}
                <EpisodeEventsTableBody
                  index={index}
                  seasonId={episode.seasonId}
                  episodeNumber={episode.episodeNumber}
                  mockEvents={mockEvents}
                  filteredEvents={filteredEvents[episode.episodeNumber] ?? []}
                  filteredPredictions={filteredPredictions[episode.episodeNumber] ?? []}
                  enrichmentEvents={enrichmentOnlyEvents}
                  edit={edit}
                  filters={filters} />
              </Fragment>
            ))}
        </TableBody >
      </Table>
      <ScrollBar hidden orientation='horizontal' />
    </ScrollArea>
  );
}
