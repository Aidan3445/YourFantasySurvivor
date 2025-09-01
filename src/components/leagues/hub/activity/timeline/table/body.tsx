'use client';

import { TableCell, TableRow } from '~/components/common/table';
import { useLeague } from '~/hooks/useLeague';
import {
  BaseEventFullName, type LeagueEventId, type LeagueEventName, type ReferenceType, type ScoringBaseEventName
} from '~/types/events';
import { type LeagueMemberDisplayName } from '~/types/leagueMembers';
import { type CastawayName } from '~/types/castaways';
import { type TribeName } from '~/types/tribes';
import { type EpisodeEventsProps } from '~/components/leagues/hub/activity/timeline/table/view';
import BaseEventRow from '~/components/leagues/hub/activity/timeline/table/row/base';
import LeagueEventRow from '~/components/leagues/hub/activity/timeline/table/row/custom';

export default function EpisodeEventsTableBody({
  labelRow,
  episodeNumber,
  mockBases,
  mockPredictions,
  mockDirects,
  edit,
  filters
}: EpisodeEventsProps) {
  const {
    leagueData: {
      baseEvents,
      basePredictions,
      leagueEvents,
      baseEventRules,
      selectionTimeline,
      castaways,
      tribes
    }
  } = useLeague();

  const filteredBaseEvents = Object.values(
    baseEvents[episodeNumber] ?? {})
    .filter((event) => {
      if (filters.event.length > 0 &&
        !filters.event.includes(event.eventName)) return false;
      if (filters.castaway.length > 0 &&
        !filters.castaway.some((castaway) => event.castaways.includes(castaway))) return false;
      if (filters.tribe.length > 0 && (event.tribes.length === 0 ||
        !filters.tribe.some((tribe) => event.tribes.includes(tribe)))) return false;
      if (filters.member.length > 0) {
        const members = event.castaways.map((castaway) =>
          selectionTimeline.castawayMembers[castaway]?.slice(0, episodeNumber + 1).pop());
        if (!members.some((member) => member && filters.member.includes(member))) return false;
      }
      return true;
    });

  const combinedPredictions = Object.values(
    [
      ...basePredictions[episodeNumber] ?? [],
      ...leagueEvents.predictionEvents[episodeNumber] ?? []
    ].reduce((acc, event) => {
      if (event.hit === null || event.eventId === null) return acc; // Skip events without results

      if (filters.event.length > 0 && !filters.event.includes(event.eventName)) return acc;
      if (filters.castaway.length > 0 && event.reference.referenceType === 'Castaway' &&
        !filters.castaway.some((castaway) => event.reference.referenceName === castaway)) return acc;
      if (filters.tribe.length > 0 &&
        (event.reference.referenceType === 'Tribe' &&
          !filters.tribe.some((tribe) => event.reference.referenceName === tribe) ||
          event.reference.referenceType === 'Castaway' &&
          !filters.tribe.includes(castaways
            .find((castaway) => castaway.fullName === event.reference.referenceName)?.tribes
            .findLast((tribeEp) => tribeEp.episode <= episodeNumber)?.tribeName ?? ''))) return acc;
      if (filters.member.length > 0 &&
        !filters.member.some((member) => event.predictionMaker === member)) return acc;

      acc[event.eventId] ??= {
        eventName: typeof event.eventId === 'string' ?
          BaseEventFullName[event.eventName as ScoringBaseEventName] :
          event.eventName,
        points: event.points,
        notes: 'notes' in event ? event.notes : null,
        references: [],
        predictionMakers: [],
        misses: []
      };

      const references: {
        referenceId: number;
        referenceType: ReferenceType;
        // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
        referenceName: CastawayName | TribeName;
      }[] = [];

      const isLeagueEvent = 'leagueEventRuleId' in event;
      if (isLeagueEvent) {
        references.push(event.reference);
      } else {
        const referenceType = baseEvents[episodeNumber]?.[event.eventId]?.referenceType ?? 'Castaway';
        baseEvents[episodeNumber]?.[event.eventId]?.references.forEach((reference) => {
          references.push({
            referenceId: reference,
            referenceType: referenceType,
            referenceName: (referenceType === 'Castaway' ?
              castaways.find((castaway) => castaway.castawayId === reference)?.fullName :
              tribes.find((tribe) => tribe.tribeId === reference)?.tribeName) ?? ''
          });
        });
      }


      if (event.hit === undefined) {
        acc[event.eventId]!.references.push(...references);
        return acc;
      }

      if (event.hit) {
        acc[event.eventId]!.predictionMakers.push({
          displayName: event.predictionMaker,
          bet: event.bet
        });
        acc[event.eventId]!.references.push(...references);
      } else {
        acc[event.eventId]!.misses.push({
          displayName: event.predictionMaker,
          bet: event.bet,
          reference: {
            referenceId: event.reference.referenceId,
            referenceType: event.reference.referenceType,
            referenceName: event.reference.referenceName
          }
        });
      }

      return acc;
    }, {} as Record<LeagueEventId | ScoringBaseEventName, {
      eventName: LeagueEventName;
      eventId?: LeagueEventId;
      points: number;
      notes: string[] | null;
      references: {
        referenceId: number;
        referenceType: ReferenceType;
        // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
        referenceName: CastawayName | TribeName;
      }[];
      predictionMakers: {
        displayName: LeagueMemberDisplayName;
        bet?: number | null;
      }[];
      misses: {
        displayName: LeagueMemberDisplayName;
        bet?: number | null;
        // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
        reference: {
          referenceId: number;
          referenceType: ReferenceType;
          // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
          referenceName: CastawayName | TribeName;
        };
      }[]
    }>) ?? {})
    .map((event) => {
      if (event.predictionMakers.length === 0) event.predictionMakers = [{
        displayName: 'No Correct Predictions'
      }];
      return event;
    });
  console.log({ HEY: combinedPredictions });

  const filteredDirectEvents = Object.values(
    leagueEvents.directEvents[episodeNumber] ?? {})
    .flat()
    .filter((event) => {
      if (filters.member.length > 0 &&
        !filters.event.includes(event.eventName)) return false;
      if (filters.event.length > 0 && event.referenceType === 'Castaway' &&
        !filters.castaway.some((castaway) => event.referenceName === castaway)) return false;
      if (filters.event.length > 0 && event.referenceType === 'Tribe' &&
        !filters.tribe.some((tribe) => event.referenceName === tribe)) return false;
      if (filters.member.length > 0) {
        const eventCastaways = event.referenceType === 'Castaway' ?
          [event.referenceName] :
          castaways
            .filter((castaway) => castaway.tribes.findLast((tribeEp) =>
              tribeEp.episode <= episodeNumber)?.tribeName === event.referenceName)
            .map((castaway) => castaway.fullName);

        const members = eventCastaways.map((castaway) =>
          selectionTimeline.castawayMembers[castaway]?.slice(
            0, episodeNumber + 1).pop());
        if (!members.some((member) => member && filters.member.includes(member))) return false;
      }
      return true;
    });


  if (!filteredBaseEvents.length && !combinedPredictions.length && !filteredDirectEvents.length &&
    !mockBases && !mockPredictions && !mockDirects
  ) {
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
      {mockBases?.map((mockBase, index) =>
        <BaseEventRow
          key={index}
          className='bg-yellow-500'
          baseEvent={{ ...mockBase, baseEventId: -1 }}
          episodeNumber={episodeNumber}
          baseEventRules={baseEventRules}
          edit={false} />
      )}
      {mockPredictions?.map((mockPrediction, index) =>
        <LeagueEventRow
          key={index}
          className='bg-yellow-500'
          eventId={-1}
          eventName={mockPrediction.eventName}
          points={mockPrediction.points}
          predictionMakers={[{ displayName: mockPrediction.predictionMaker }]}
          references={[mockPrediction.reference]}
          notes={mockPrediction.notes}
          episodeNumber={episodeNumber}
          edit={false} />
      )}
      {mockDirects?.map((mockDirect, index) =>
        <LeagueEventRow
          key={index}
          className='bg-yellow-500'
          eventId={-1}
          eventName={mockDirect.eventName}
          points={mockDirect.points}
          references={[{
            referenceId: mockDirect.referenceId,
            referenceType: mockDirect.referenceType,
            referenceName: mockDirect.referenceName
          }]}
          notes={mockDirect.notes}
          episodeNumber={episodeNumber}
          edit={false} />
      )}
      {filteredBaseEvents.length > 0 &&
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
      {filteredBaseEvents
        .map((event) => (
          <BaseEventRow
            key={event.baseEventId}
            baseEvent={event}
            episodeNumber={episodeNumber}
            baseEventRules={baseEventRules}
            edit={edit}
            memberFilter={filters.member} />
        ))}
      {filteredDirectEvents.length > 0 &&
        <TableRow className='bg-gray-100 hover:bg-gray-200'>
          <TableCell colSpan={7} className='text-xs text-muted-foreground'>
            Custom Events
          </TableCell>
        </TableRow>}
      {filteredDirectEvents.map((event, index) => (
        <LeagueEventRow
          key={index}
          eventId={event.eventId}
          eventName={event.eventName}
          points={event.points}
          references={[{
            referenceId: event.referenceId,
            referenceType: event.referenceType,
            referenceName: event.referenceName
          }]}
          notes={event.notes}
          episodeNumber={episodeNumber}
          edit={edit} />
      ))}
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
    </>
  );
}

