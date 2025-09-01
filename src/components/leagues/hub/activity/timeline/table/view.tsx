/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
'use client';

import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/common/table';
import { useLeague } from '~/hooks/useLeague';
import type { EpisodeNumber } from '~/types/episodes';
import {
  type BaseEvent, type BaseEventName, type LeagueDirectEvent, type CustomEventName, type CustomPredictionEvent
} from '~/types/events';
import { type LeagueMemberDisplayName } from '~/types/leagueMembers';
import { type CastawayName } from '~/types/castaways';
import { type TribeName } from '~/types/tribes';
import EpisodeEventsTableBody from '~/components/leagues/hub/activity/timeline/table/body';


export interface EpisodeEventsProps {
  episodeNumber: EpisodeNumber;
  mockBases?: Omit<BaseEvent, 'baseEventId'>[];
  mockPredictions?: Omit<CustomPredictionEvent, 'eventId'>[];
  mockDirects?: Omit<LeagueDirectEvent, 'eventId'>[];
  edit?: boolean;
  labelRow?: boolean;
  filters: {
    castaway: CastawayName[];
    tribe: TribeName[];
    member: LeagueMemberDisplayName[];
    event: (BaseEventName | CustomEventName)[];
  };
}

export default function EpisodeEvents({
  episodeNumber,
  mockBases,
  mockPredictions,
  mockDirects,
  edit,
  filters }: EpisodeEventsProps) {
  const {
    leagueData: {
      customEvents,
      baseEvents,
      basePredictions,
      episodes
    }
  } = useLeague();

  if (episodeNumber === 5) {
    console.log({ baseEvents, basePredictions, customEvents, mockBases, mockPredictions, mockDirects });
  }

  const noTribes = episodeNumber !== -1 && (
    !(
      baseEvents[episodeNumber] &&
      Object.values(baseEvents[episodeNumber]).some((event) => event.tribes.length > 0)
    ) &&
    !mockBases?.some((event) => event.tribes.length > 0) &&
    !(
      basePredictions[episodeNumber] &&
      Object.values(basePredictions[episodeNumber]).some((event) => event.reference.referenceType === 'Tribe' && event.eventId !== null)
    ) &&
    ![...customEvents.predictionEvents[episodeNumber] ?? [], ...mockPredictions ?? []]
      ?.some((event) => event.reference.referenceType === 'Tribe') &&
    ![...customEvents.directEvents[episodeNumber]?.Tribe ?? [], ...mockDirects ?? []]
      ?.some((event) => event.referenceType === 'Tribe'));


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
          {episodes.filter((episode) =>
            episodeNumber === -1 || episode.episodeNumber === episodeNumber)
            .map((episode) => (
              <EpisodeEventsTableBody
                key={episode.episodeNumber}
                episodeNumber={episode.episodeNumber}
                mockBases={mockBases}
                mockPredictions={mockPredictions}
                mockDirects={mockDirects}
                edit={edit}
                filters={filters}
                labelRow={episodeNumber === -1} />
            ))}
        </TableBody>
      </Table>
      <ScrollBar hidden orientation='horizontal' />
    </ScrollArea>
  );
}
