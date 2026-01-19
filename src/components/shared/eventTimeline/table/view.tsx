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
import EpisodeEventsTableBody from '~/components/shared/eventTimeline/table/body';
import { findTribeCastaways } from '~/lib/utils';
import { type Prediction, type EventWithReferences } from '~/types/events';
import { type SeasonsDataQuery } from '~/types/seasons';
import type { LeagueData } from '~/components/shared/eventTimeline/filters';


export interface EpisodeEventsProps {
  episodeNumber: number;
  seasonData: SeasonsDataQuery;
  leagueData?: LeagueData;
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

export default function EpisodeEvents({
  episodeNumber, seasonData, leagueData, mockEvents, edit, filters
}: EpisodeEventsProps) {
  const { league, selectionTimeline, customEvents, basePredictions } = leagueData ?? {};

  const { baseEvents, episodes, tribesTimeline, eliminations } = useMemo(() =>
    seasonData, [seasonData]);

  // All events for lookup purposes (needed to validate predictions reference valid events)
  const allEvents = useMemo(() => {
    const events: Record<number, EventWithReferences[]> = {};
    (episodes ?? []).forEach((episode) => {
      events[episode.episodeNumber] = [
        ...(baseEvents?.[episode.episodeNumber]
          ? Object.values(baseEvents[episode.episodeNumber]!) : []),
        ...(customEvents?.events?.[episode.episodeNumber]
          ? Object.values(customEvents.events[episode.episodeNumber] ?? {}) : [])
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
            ? Object.values(basePredictions[episode.episodeNumber] ?? {}).flat() : []),
          ...(customEvents?.predictions?.[episode.episodeNumber]
            ? Object.values(customEvents.predictions[episode.episodeNumber] ?? {}).flat() : []),
        ].filter((prediction) => {
          const eventEpNum = prediction.eventEpisodeNumber;
          if (!eventEpNum) return false;

          const matchingEvent = allEvents[eventEpNum]?.find(
            (event) => event.eventName === prediction.eventName
          );

          if (matchingEvent) {
            // If the event is from a different episode than where prediction was made
            if (eventEpNum !== episode.episodeNumber) {
              if (!enrichmentEvents.some(e => e.eventId === matchingEvent.eventId)) {
                enrichmentEvents.push(matchingEvent);
              }
            }
            return true;
          }
          return false;
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

  const filteredPredictions = useMemo(() => {
    const filtered: Record<number, PredictionAndPredOnly[] | undefined> = {};
    Object.keys(combinedPredictions).forEach((key) => {
      const numKey = Number(key);
      filtered[numKey] = combinedPredictions[numKey]?.filter((prediction) => {
        // Reference match: if either castaway or tribe filters are set,
        // the prediction must match at least one of them based on its type
        const hasReferenceFilters = filters.castaway.length > 0 || filters.tribe.length > 0;
        const referenceMatch = !hasReferenceFilters || (
          (prediction.referenceType === 'Castaway' && filters.castaway.includes(prediction.referenceId)) ||
          (prediction.referenceType === 'Tribe' && filters.tribe.includes(prediction.referenceId))
        );

        const memberMatch = filters.member.length === 0 ||
          filters.member.includes(prediction.predictionMakerId);

        const eventEpNum = prediction.eventEpisodeNumber;
        const eventMatch = filters.event.length === 0 || (
          eventEpNum && allEvents[eventEpNum]?.some((event) =>
            event.eventName === prediction.eventName && filters.event.includes(event.eventName))
        );

        return referenceMatch && memberMatch && eventMatch;
      });
    });
    return filtered;
  }, [
    allEvents,
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
      filtered[numKey] = combinedEvents[numKey]?.map((event): EventWithReferencesAndPredOnly | null => {
        const castawayMembers = selectionTimeline?.castawayMembers;

        // Calculate event members only if we have league context and member filters
        const eventMembers = (castawayMembers && filters.member.length > 0)
          ? event.references.flatMap((ref) => {
            if (ref.type === 'Castaway' && numKey >= (league?.startWeek ?? 0)) {
              const data = castawayMembers[ref.id];
              return data?.[numKey] ?? data?.[data.length - 1] ?? [];
            }

            return findTribeCastaways(tribesTimeline ?? {}, eliminations ?? [], ref.id, numKey)
              .flatMap((cid) => {
                if (numKey < (league?.startWeek ?? 0)) return [];
                const data = castawayMembers[cid];
                return data?.[numKey] ?? data?.[data.length - 1] ?? [];
              });
          })
          : [];
        Object.entries(selectionTimeline?.secondaryPicks ?? {}).forEach(([memberId, picks]) => {
          if (event.references.some((ref) =>
            ref.type === 'Castaway' && picks[numKey] === ref.id)) {
            eventMembers.push(Number(memberId));
          }
        });



        const castawayMatch = filters.castaway.length === 0 || event.references.some((ref) =>
          ref.type === 'Castaway' && filters.castaway.includes(ref.id));
        const tribeMatch = filters.tribe.length === 0 || event.references.some((ref) =>
          ref.type === 'Tribe' && filters.tribe.includes(ref.id));
        const memberMatch = filters.member.length === 0 || eventMembers.some((ref) =>
          filters.member.includes(ref));
        const eventMatch = filters.event.length === 0 || filters.event.includes(event.eventName);

        const keep = castawayMatch && tribeMatch && memberMatch && eventMatch;

        // Check if any predictions for this event exist (without mutating)
        const hasPredictions = filteredPredictions[numKey]?.some((prediction) =>
          prediction.eventId === event.eventId);

        if (keep) {
          return { ...event, predOnly: false };
        } else if (hasPredictions) {
          return { ...event, predOnly: true };
        }
        return null;
      }).filter((event): event is EventWithReferencesAndPredOnly => event !== null);
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
    league?.startWeek,
    selectionTimeline?.castawayMembers,
    selectionTimeline?.secondaryPicks,
    tribesTimeline
  ]);

  // Compute predOnly for predictions based on filtered events (separate, no mutation)
  const filteredPredictionsWithPredOnly = useMemo(() => {
    const result: Record<number, PredictionAndPredOnly[] | undefined> = {};
    Object.keys(filteredPredictions).forEach((key) => {
      const numKey = Number(key);
      result[numKey] = filteredPredictions[numKey]?.map((prediction) => {
        const event = filteredEvents[numKey]?.find(e => e.eventId === prediction.eventId);
        return {
          ...prediction,
          predOnly: event?.predOnly ?? false
        };
      });
    });
    return result;
  }, [filteredPredictions, filteredEvents]);

  const noTribes = useMemo(() => episodeNumber !== -1 && (
    !combinedEvents[episodeNumber]?.some((event) => event.references.some((ref) => ref.type === 'Tribe'))
    && !combinedPredictions[episodeNumber]?.some((prediction) => prediction.referenceType === 'Tribe')
    && !mockEvents?.some((event) => event.references.some((ref) => ref.type === 'Tribe'))
  ), [combinedEvents, combinedPredictions, episodeNumber, mockEvents]);

  const noMembers = useMemo(() => !selectionTimeline || !league, [selectionTimeline, league]);

  return (
    <ScrollArea className='bg-card gap-0'>
      <Table className='w-full'>
        <TableCaption className='sr-only'>Events from the previous episode</TableCaption>
        <TableHeader>
          <TableRow className='bg-white border-b-2 border-primary/20 hover:bg-white/80 px-4 gap-4 items-center text-nowrap'>
            {edit && (
              <TableHead className='w-0 font-bold uppercase text-xs tracking-wider'>
                Edit
              </TableHead>
            )}
            <TableHead className='font-bold uppercase text-xs tracking-wider w-0'>
              Event
            </TableHead>
            <TableHead className='text-center font-bold uppercase text-xs tracking-wider'>
              Points
            </TableHead>
            <TableHead className='font-bold uppercase text-xs tracking-wider'>
              {noTribes ? null : 'Tribes'}
            </TableHead>
            <TableHead className='text-left font-bold uppercase text-xs tracking-wider'>
              Castaways
            </TableHead>
            {!noMembers && (
              <TableHead className='w-full font-bold uppercase text-xs tracking-wider'>
                Members
              </TableHead>
            )}
            <TableHead className='font-bold uppercase text-xs tracking-wider'>
              Notes
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {episodes?.filter((episode) =>
            episodeNumber === -1 || episode.episodeNumber === episodeNumber)
            .map((episode, index) => (
              <Fragment key={`timeline-${episode.episodeNumber}`}>
                {episodeNumber === -1 &&
                  <TableRow className='bg-primary/10 border-t-2 border-primary/20 hover:bg-primary/5'>
                    <TableCell colSpan={7} className='text-center font-black uppercase text-sm tracking-wider py-3'>
                      Episode {episode.episodeNumber}: {episode.title}
                    </TableCell>
                  </TableRow>}
                <EpisodeEventsTableBody
                  index={index}
                  seasonId={episode.seasonId}
                  episodeNumber={episode.episodeNumber}
                  mockEvents={mockEvents}
                  filteredEvents={filteredEvents[episode.episodeNumber] ?? []}
                  filteredPredictions={filteredPredictionsWithPredOnly[episode.episodeNumber] ?? []}
                  predictionEnrichmentEvents={enrichmentOnlyEvents}
                  edit={edit}
                  filters={filters}
                  noMembers={noMembers}
                  seasonData={seasonData}
                  leagueData={leagueData} />
              </Fragment>
            ))}
        </TableBody>
      </Table>
      <ScrollBar hidden orientation='horizontal' />
    </ScrollArea>
  );
}
