/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
'use client';

import { PopoverArrow } from '@radix-ui/react-popover';
import { Flame, MoveRight, ScrollText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { ScrollArea, ScrollBar } from '~/components/ui/scrollArea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { MultiSelect } from '~/components/ui/multiSelect';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { useLeague } from '~/hooks/useLeague';
import { cn } from '~/lib/utils';
import type { EpisodeNumber, EpisodeAirStatus } from '~/server/db/defs/episodes';
import {
  type BaseEvent, BaseEventFullName, baseEventLabelPrefixes, baseEventLabels,
  type BaseEventName, type BaseEventRule, type LeagueDirectEvent, type LeagueEventId, type LeagueEventName,
  type LeaguePredictionEvent, type ReferenceType, type ScoringBaseEventName, ScoringBaseEventNames
} from '~/server/db/defs/events';
import { type LeagueMemberDisplayName } from '~/server/db/defs/leagueMembers';
import EditBaseEvent from './editBaseEvent';
import { ColorRow } from '../draftOrder';
import EditLeagueEvent from './editLeagueEvent';
import { useIsMobile } from '~/hooks/useMobile';
import { type CastawayName } from '~/server/db/defs/castaways';
import { type TribeName } from '~/server/db/defs/tribes';
import { Label } from '~/components/ui/label';

export default function RecentActivity() {
  const {
    leagueData: {
      episodes,
      castaways,
      tribes,
    },
    league: {
      members: {
        list: members
      },
      customEventRules
    }
  } = useLeague();
  const isMobile = useIsMobile();

  const [filterCastaway, setFilterCastaway] = useState<CastawayName[]>([]);
  const [filterTribe, setFilterTribe] = useState<TribeName[]>([]);
  const [filterMember, setFilterMember] = useState<LeagueMemberDisplayName[]>([]);
  const [filterEvent, setFilterEvent] = useState<(BaseEventName | LeagueEventName)[]>([]);

  const [selectedEpisode, setSelectedEpisode] = useState<number>();

  useEffect(() => {
    if (selectedEpisode) return;

    const latestEpisode = episodes.find((episode) =>
      episode.airStatus === 'Airing') ??
      episodes.findLast((episode) => episode.airStatus === 'Aired') ??
      episodes[0];
    setSelectedEpisode(latestEpisode?.episodeNumber);
  }, [episodes, selectedEpisode]);

  return (
    <section className='w-full bg-card rounded-lg relative place-items-center'>
      <Accordion type='single' collapsible>
        <AccordionItem value='filter' className='border-none'>
          <span className='flex flex-wrap gap-x-4 items-baseline px-2 mr-14 justify-center'>
            <h2 className='text-lg font-bold text-card-foreground'>Activity</h2>
            <Select
              defaultValue={`${selectedEpisode}`}
              value={`${selectedEpisode}`}
              onValueChange={(value) => setSelectedEpisode(Number(value))}>
              <SelectTrigger className='w-min'>
                <SelectValue placeholder='Select an episode' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='-1'>
                  All Episodes
                </SelectItem>
                {episodes.toReversed()
                  .map((episode) => (
                    <SelectItem key={episode.episodeNumber} value={`${episode.episodeNumber}`}>
                      {`${episode.episodeNumber}:`} {episode.episodeTitle}
                      <div className='inline ml-1'>
                        <AirStatus
                          airDate={episode.episodeAirDate}
                          airStatus={episode.airStatus}
                          showTime={false}
                          showDate={!isMobile} />
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <AccordionTrigger className='w-full'>
              Filters
            </AccordionTrigger>
          </span>
          <AccordionContent className='w-full flex-col md:flex-row flex flex-wrap justify-evenly items-center gap-4 px-2'>
            <div className='w-min flex flex-col items-center'>
              <Label className='text-sm font-semibold text-muted-foreground'>
                Castaway Filter
              </Label>
              <MultiSelect
                options={castaways.map((castaway) => ({
                  value: castaway.fullName,
                  label: castaway.fullName
                }))}
                value={filterCastaway}
                onValueChange={(value) => setFilterCastaway(value as CastawayName[])}
                modalPopover
                placeholder='All Castaways'
              />
            </div>
            <div className='w-min flex flex-col items-center'>
              <Label className='text-sm font-semibold text-muted-foreground'>
                Tribe Filter
              </Label>
              <MultiSelect
                options={tribes.map((tribe) => ({
                  value: tribe.tribeName,
                  label: tribe.tribeName
                }))}
                value={filterTribe}
                onValueChange={(value) => setFilterTribe(value as TribeName[])}
                modalPopover
                placeholder='All Tribes'
              />
            </div>
            <div className='w-min flex flex-col items-center'>
              <Label className='text-sm font-semibold text-muted-foreground'>
                Member Filter
              </Label>
              <MultiSelect
                options={members.map((member) => ({
                  value: member.displayName,
                  label: member.displayName
                }))}
                value={filterMember}
                onValueChange={(value) => setFilterMember(value as LeagueMemberDisplayName[])}
                modalPopover
                placeholder='All Members'
              />
            </div>
            <div className='w-min flex flex-col items-center'>
              <Label className='text-sm font-semibold text-muted-foreground'>
                Event Filter
              </Label>
              <MultiSelect
                options={[
                  { label: 'Official Events', value: null },
                  ...Object.entries(BaseEventFullName)
                    .map(([eventName, eventFullName]) => ({
                      value: eventName,
                      label: eventFullName
                    })),
                  { label: 'Custom Events', value: null },
                  ...Object.values(customEventRules)
                    .map((event) => ({
                      value: event.eventName,
                      label: event.eventName
                    }))
                ]}
                value={filterEvent}
                onValueChange={(value) =>
                  setFilterEvent(value as (BaseEventName | LeagueEventName)[])}
                modalPopover
                placeholder='All Events'
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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

interface EpisodeEventsProps {
  episodeNumber: EpisodeNumber;
  mockBases?: Omit<BaseEvent, 'baseEventId'>[];
  mockPredictions?: Omit<LeaguePredictionEvent, 'eventId'>[];
  mockDirects?: Omit<LeagueDirectEvent, 'eventId'>[];
  edit?: boolean;
  labelRow?: boolean;
  filters: {
    castaway: CastawayName[];
    tribe: TribeName[];
    member: LeagueMemberDisplayName[];
    event: (BaseEventName | LeagueEventName)[];
  };
}

export function EpisodeEvents({
  episodeNumber,
  mockBases,
  mockPredictions,
  mockDirects,
  edit,
  filters }: EpisodeEventsProps) {
  const {
    leagueData: {
      baseEvents,
      leagueEvents,
      episodes
    }
  } = useLeague();
  const noTribes = episodeNumber === -1 || (
    baseEvents[episodeNumber] &&
    !Object.values(baseEvents[episodeNumber]).some((event) => event.tribes.length > 0) &&
    !mockBases?.some((event) => event.tribes.length > 0) &&
    ![...leagueEvents.predictionEvents[episodeNumber] ?? [], ...mockPredictions ?? []]
      ?.some((event) => event.referenceType === 'Tribe') &&
    ![...leagueEvents.directEvents[episodeNumber]?.Tribe ?? [], ...mockDirects ?? []]
      ?.some((event) => event.referenceType === 'Tribe'));

  return (
    <ScrollArea className='w-[calc(100svw-2.5rem)] md:w-[calc(100svw-8rem)] lg:w-full bg-card rounded-lg gap-0'>
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

function EpisodeEventsTableBody({
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
    leagueEvents.predictionEvents[episodeNumber]?.reduce((acc, event) => {
      if (filters.event.length > 0 && !filters.event.includes(event.eventName)) return acc;
      if (filters.castaway.length > 0 && event.referenceType === 'Castaway' &&
        !filters.castaway.some((castaway) => event.referenceName === castaway)) return acc;
      if (filters.tribe.length > 0 &&
        (event.referenceType === 'Tribe' &&
          !filters.tribe.some((tribe) => event.referenceName === tribe) ||
          event.referenceType === 'Castaway' &&
          !filters.tribe.includes(castaways
            .find((castaway) => castaway.fullName === event.referenceName)?.tribes
            .findLast((tribeEp) => tribeEp.episode <= episodeNumber)?.tribeName ?? ''))) return acc;
      if (filters.member.length > 0 &&
        !filters.member.some((member) => event.predictionMaker === member)) return acc;

      acc[event.eventId] ??= {
        eventId: event.eventId,
        eventName: event.eventName,
        points: event.points,
        notes: event.notes,
        referenceId: event.referenceId,
        referenceType: event.referenceType,
        referenceName: event.referenceName,
        predictionMakers: [],
        misses: []
      };

      if (event.hit) acc[event.eventId]!.predictionMakers.push(event.predictionMaker);
      else acc[event.eventId]!.misses.push({
        predictionMaker: event.predictionMaker,
        referenceName: (event.referenceType === 'Castaway' ?
          castaways.find((castaway) => castaway.castawayId === event.referenceId)?.fullName :
          tribes.find((tribe) => tribe.tribeId === event.referenceId)?.tribeName) ?? ''
      });

      return acc;
    }, {} as Record<LeagueEventId, {
      eventId: LeagueEventId;
      eventName: LeagueEventName;
      points: number;
      notes: string[] | null;
      referenceId: number;
      referenceType: ReferenceType;
      // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
      referenceName: CastawayName | TribeName;
      predictionMakers: LeagueMemberDisplayName[];
      misses: {
        predictionMaker: LeagueMemberDisplayName;
        // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
        referenceName: CastawayName | TribeName;
      }[]
    }>) ?? {})
    .map((event) => {
      if (event.predictionMakers.length === 0) event.predictionMakers = ['No Correct Predictions'];
      return event;
    });

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
      {labelRow &&
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
          predictionMakers={[mockPrediction.predictionMaker]}
          referenceId={mockPrediction.referenceId}
          referenceType={mockPrediction.referenceType}
          referenceName={mockPrediction.referenceName}
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
          referenceId={mockDirect.referenceId}
          referenceType={mockDirect.referenceType}
          referenceName={mockDirect.referenceName}
          notes={mockDirect.notes}
          episodeNumber={episodeNumber}
          edit={false} />
      )}
      {filteredBaseEvents.length > 0 &&
        <TableRow className='bg-gray-100 hover:bg-gray-200'>
          <TableCell colSpan={7} className='text-xs text-muted-foreground'>
            Official Events
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
          referenceType={event.referenceType}
          referenceName={event.referenceName}
          referenceId={event.referenceId}
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
          referenceType={event.referenceType}
          referenceName={event.referenceName}
          referenceId={event.referenceId}
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


interface EventRowProps {
  baseEventName?: BaseEventName;
  baseEventRules?: BaseEventRule;
  points?: number;
}

function PointsCell({ baseEventName: eventName, baseEventRules, points }: EventRowProps) {
  if ((!ScoringBaseEventNames.includes(eventName as ScoringBaseEventName) || !baseEventRules) &&
    !points)
    return <TableCell className='text-xs text-muted-foreground text-center'>N/A</TableCell>;

  points ??= baseEventRules?.[eventName as ScoringBaseEventName];

  return (
    <TableCell className={cn('text-sm text-center',
      points! > 0 ? 'text-green-600' : 'text-destructive')}>
      {points! > 0 ? `+${points}` : points}
      <Flame className={cn(
        'inline align-top w-4 h-min',
        points! > 0 ? 'stroke-green-600' : 'stroke-destructive')} />
    </TableCell>
  );
}

interface NotesPopoverProps {
  notes: string[] | null;
}

function NotesPopover({ notes }: NotesPopoverProps) {
  const filteredNotes = notes?.filter((note) => !!note);

  if (!filteredNotes || filteredNotes.length === 0) return (
    <span className='w-full flex justify-end'>
      <ScrollText className='stroke-muted-foreground/50' />
    </span>
  );

  return (
    <Popover>
      <PopoverTrigger className='ml-auto flex justify-end'>
        <ScrollText />
      </PopoverTrigger>
      <PopoverContent className='pl-6 w-max max-w-[40svw] min-w-72' side='left'>
        <PopoverArrow />
        <ul>
          {filteredNotes.map((note, index) => (
            <li className='list-disc' key={index}>
              {note.startsWith('https://') ?
                <a
                  className='text-blue-500 underline'
                  href={note}
                  target='_blank'
                  rel='noopener noreferrer'>
                  {note}
                </a> :
                note}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

type AirStatusProps = {
  airDate: Date;
  airStatus: EpisodeAirStatus;
  showDate?: boolean;
  showTime?: boolean;
};

export function AirStatus({ airDate, airStatus, showDate = true, showTime = true }: AirStatusProps) {
  return (
    <span className='inline-flex gap-1 items-center text-sm text-muted-foreground'>
      {showDate && (showTime ? airDate.toLocaleString() : airDate.toLocaleDateString())}
      <div className={cn('text-destructive-foreground text-xs px-1 rounded-md',
        airStatus === 'Aired' && 'bg-destructive',
        airStatus === 'Upcoming' && 'bg-amber-500',
        airStatus === 'Airing' && 'bg-green-600')}>
        {airStatus}
      </div>
    </span>
  );
}

interface BaseEventRowProps {
  className?: string;
  baseEvent: BaseEvent;
  episodeNumber: EpisodeNumber;
  baseEventRules: BaseEventRule;
  edit?: boolean;
  memberFilter?: LeagueMemberDisplayName[];
}

function BaseEventRow({
  baseEvent, episodeNumber, baseEventRules, edit, memberFilter, className
}: BaseEventRowProps) {
  const { leagueData, league } = useLeague();
  const { eventName, label, tribes, castaways, notes } = baseEvent;

  const members =
    castaways?.map((castaway) =>
      leagueData.selectionTimeline.castawayMembers[castaway]?.slice(
        0, episodeNumber + 1).pop());

  if (memberFilter && memberFilter.length > 0 &&
    !memberFilter.some((member) => members.includes(member))) return null;

  return (
    <TableRow className={className}>
      {edit ? <TableCell className='w-0'>
        <EditBaseEvent episodeNumber={episodeNumber} baseEvent={baseEvent} />
      </TableCell> :
        edit === false ? <TableCell className='w-0' /> : null}
      <TableCell className='text-nowrap'>
        <p className='text-xs text-muted-foreground'>{BaseEventFullName[eventName]}</p>
        { // disable because we want label to be ignored if empty string as well as undefined
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          label || (`${baseEventLabelPrefixes[eventName]} ${baseEventLabels[eventName]?.[0] ?? eventName}`)}
      </TableCell>
      <PointsCell baseEventName={eventName} baseEventRules={baseEventRules} />
      <TableCell className='text-center' style={{ height: 'inherit' }}>
        <div className='h-full grid auto-rows-fr items-center'>
          {tribes?.map((tribe, index) => (
            <ColorRow
              key={index}
              className='leading-tight px-1 w-min'
              color={leagueData.castaways.find((listItem) =>
                listItem.tribes.some((tribeEp) => tribeEp.tribeName === tribe))?.tribes
                .find((tribeEp) => tribeEp.tribeName === tribe)?.tribeColor}>
              {tribe}
            </ColorRow>
          ))}
        </div>
      </TableCell >
      <TableCell className='text-right'>
        <div className={cn(
          'text-xs flex flex-col h-full gap-0.5 items-end',
          castaways?.length === 1 && 'justify-center')}>
          {castaways?.map((castaway, index) => (
            <ColorRow
              key={index}
              className='leading-tight px-1 w-min'
              color={leagueData.castaways.find((listItem) =>
                listItem.fullName === castaway)?.tribes.findLast((tribeEp) =>
                  tribeEp.episode <= episodeNumber)?.tribeColor}>
              {castaway}
            </ColorRow>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <div className={cn(
          'flex flex-col text-xs h-full gap-0.5',
          members?.length === 1 && 'justify-center')}>
          {members?.map((member, index) =>
            member ?
              <ColorRow
                key={index}
                className='leading-tight px-1 w-min'
                color={league.members.list.find((listItem) =>
                  listItem.displayName === member)?.color}>
                {member}
              </ColorRow> :
              <ColorRow className='invisible leading-tight px-1 w-min' key={index}>
                None
              </ColorRow>
          )}
        </div>
      </TableCell>
      <TableCell>
        <NotesPopover notes={notes} />
      </TableCell>
    </TableRow >
  );
}

interface LeagueEventRowProps {
  className?: string;
  eventName: LeagueEventName;
  eventId: number;
  points: number;
  referenceType: ReferenceType;
  referenceName?: string;
  referenceId: number;
  predictionMakers?: LeagueMemberDisplayName[];
  notes: string[] | null;
  misses?: {
    predictionMaker: LeagueMemberDisplayName;
    // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
    referenceName: CastawayName | TribeName;
  }[];
  defaultOpenMisses?: boolean;
  episodeNumber: EpisodeNumber;
  edit?: boolean;
}

function LeagueEventRow({
  eventName,
  eventId,
  points,
  referenceType,
  referenceName,
  referenceId,
  predictionMakers,
  notes,
  misses,
  defaultOpenMisses,
  episodeNumber,
  edit,
  className
}: LeagueEventRowProps) {
  const { leagueData, league } = useLeague();

  return (
    <TableRow className={className}>
      {edit ? <TableCell className='w-0'>
        <EditLeagueEvent episodeNumber={episodeNumber} leagueEvent={{
          eventId,
          eventName,
          points,
          referenceType,
          referenceId,
          notes
        }} />
      </TableCell> :
        edit === false ? <TableCell className='w-0' /> : null}
      <TableCell className='text-nowrap sticky'>{eventName}</TableCell>
      <PointsCell points={points} />
      <TableCell className='text-right text-xs text-nowrap'>
        <div className='h-full grid auto-rows-fr items-center'>
          {referenceType === 'Tribe' && referenceName &&
            <ColorRow
              className='leading-tight px-1 w-min'
              color={leagueData.castaways.find((listItem) =>
                listItem.tribes.some((tribeEp) => tribeEp.tribeName === referenceName))?.tribes
                .find((tribeEp) => tribeEp.tribeName === referenceName)?.tribeColor}>
              {referenceName}
            </ColorRow>}
        </div>
      </TableCell>
      <TableCell className='text-right text-xs text-nowrap justify-items-end'>
        {referenceType === 'Castaway' && referenceName &&
          <ColorRow
            className='leading-tight px-1 w-min'
            color={leagueData.castaways.find((listItem) =>
              listItem.fullName === referenceName)?.tribes.findLast((tribeEp) =>
                tribeEp.episode <= episodeNumber)?.tribeColor}>
            {referenceName}
          </ColorRow>}
      </TableCell>
      <TableCell className='text-xs text-nowrap'>
        <div className={cn(
          'flex flex-col text-xs h-full gap-0.5 relative',
          predictionMakers?.length === 1 && 'justify-center')}>
          {predictionMakers?.map((member, index) =>
            member ?
              <ColorRow
                key={index}
                className='leading-tight px-1 w-min'
                color={league.members.list.find((listItem) =>
                  listItem.displayName === member)?.color}>
                {member}
              </ColorRow> :
              <ColorRow className='invisible leading-tight px-1 w-min' key={index}>
                None
              </ColorRow>
          )}
          {misses && misses.length > 0 &&
            <Accordion
              type='single'
              collapsible
              value={defaultOpenMisses ? 'misses' : undefined}>
              <AccordionItem value='misses' className='border-none'>
                <AccordionTrigger className='p-0 text-xs leading-tight text-muted-foreground'>
                  Missed Predictions
                </AccordionTrigger>
                <AccordionContent className='p-0'>
                  <div className='flex flex-col gap-0.5'>
                    {misses.map((miss, index) => (
                      <span key={index} className='text-xs flex gap-1 items-center opacity-60'>
                        <ColorRow
                          className='leading-tight px-1 w-min'
                          color={league.members.list.find((listItem) =>
                            listItem.displayName === miss.predictionMaker)?.color}>
                          {miss.predictionMaker}
                        </ColorRow>
                        <MoveRight size={12} stroke='#000000' />
                        <ColorRow
                          className='leading-tight px-1 w-min'
                          color={referenceType === 'Castaway' ?
                            leagueData.castaways.find((castaway) =>
                              castaway.fullName === miss.referenceName)?.tribes
                              .findLast((tribeEp) => tribeEp.episode <= episodeNumber)?.tribeColor :
                            leagueData.tribes.find((tribe) =>
                              tribe.tribeName === miss.referenceName)?.tribeColor}>
                          {miss.referenceName}
                        </ColorRow>
                      </span>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>}
        </div>
      </TableCell>
      <TableCell>
        <NotesPopover notes={notes} />
      </TableCell>
    </TableRow>
  );
}
