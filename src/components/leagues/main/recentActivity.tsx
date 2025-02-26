'use client';

import { PopoverArrow } from '@radix-ui/react-popover';
import { Pencil, ScrollText, X } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/ui/alertDialog';
import { Button } from '~/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { ScrollArea, ScrollBar } from '~/components/ui/scrollArea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
//import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
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
import { type BaseEvent, baseEventLabelPrefixes, baseEventLabels, type BaseEventName, type BaseEventRule, type LeagueDirectEvent, type LeagueEventName, type LeaguePredictionEvent, type ReferenceType, type ScoringBaseEventName, ScoringBaseEventNames } from '~/server/db/defs/events';
import { type LeagueMemberDisplayName } from '~/server/db/defs/leagueMembers';
import EditBaseEvent from './editBaseEvent';

export default function RecentActivity() {
  const {
    leagueData: {
      episodes
    }
  } = useLeague();

  const [selectedEpisode, setSelectedEpisode] = useState(1);
  /*const [filterCastaway, setFilterCastaway] = useState();
  const [filterTribe, setFilterTribe] = useState();
  const [filterMember, setFilterMember] = useState();
  const [filterBaseEvent, setFilterBaseEvent] = useState();*/

  const latestEpisode = episodes[0];

  return (
    <section className='md:w-full bg-card rounded-lg relative'>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className='absolute top-2 right-2 text-xs px-1 h-4' variant='secondary'>
            View All
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className='bg-card rounded-lg overflow-y-auto min-w-max pb-0'>
          <AlertDialogHeader>
            <AlertDialogTitle>All Events</AlertDialogTitle>
            <AlertDialogDescription hidden>View all events from the season</AlertDialogDescription>
          </AlertDialogHeader>
          <Select
            defaultValue={`${selectedEpisode}`}
            value={`${selectedEpisode}`}
            onValueChange={(value) => setSelectedEpisode(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder='Select an episode' />
            </SelectTrigger>
            <SelectContent>
              {// eslint-disable-next-line @typescript-eslint/no-unsafe-call
                episodes.toReversed()
                  .map((episode) => (
                    <SelectItem key={episode.episodeNumber} value={`${episode.episodeNumber}`}>
                      {episode.episodeNumber} - {episode.episodeTitle}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
          {/*<Accordion type='single' collapsible>
            <AccordionItem value='filters'>
              <AccordionTrigger>
                Filters
              </AccordionTrigger>
              <AccordionContent>
                <div className='flex flex-wrap gap-4'>
                  <Select
                    value={filterCastaway}
                    onValueChange={(value) => setFilterCastaway(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder='Castaway' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>All Castaways</SelectItem>
                      <SelectItem value=''>None</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterTribe}
                    onValueChange={(value) => setFilterTribe(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder='Tribe' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>All Tribes</SelectItem>
                      <SelectItem value=''>None</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterMember}
                    onValueChange={(value) => setFilterMember(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder='Member' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>All Members</SelectItem>
                      <SelectItem value=''>None</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterBaseEvent}
                    onValueChange={(value) => setFilterBaseEvent(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder='Base Event' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>All Base Events</SelectItem>
                      <SelectItem value=''>None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>*/}
          <EpisodeEvents episodeNumber={selectedEpisode} />
          <AlertDialogFooter className='absolute top-1 right-1'>
            <AlertDialogCancel className='h-min p-1'>
              <X stroke='white' />
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent >
      </AlertDialog >
      <span className='flex flex-wrap gap-x-4 items-baseline px-2 mr-14'>
        <h2 className='text-lg font-bold text-card-foreground'>Recent Events</h2>
        {latestEpisode && <span className='inline-flex gap-4 flex-nowrap'>
          <p className='text-sm text-muted-foreground'>
            {`${latestEpisode.episodeNumber}:`} {latestEpisode.episodeTitle}
          </p>
          <AirStatus airDate={latestEpisode.episodeAirDate} airStatus={latestEpisode.airStatus} />
        </span>}
      </span>
      {latestEpisode && <EpisodeEvents episodeNumber={latestEpisode.episodeNumber} />}
    </section >
  );
}

interface EpisodeEventsProps {
  episodeNumber: EpisodeNumber;
  mockBase?: Omit<BaseEvent, 'baseEventId'>;
  mockPrediction?: LeaguePredictionEvent;
  mockDirect?: LeagueDirectEvent;
  edit?: boolean;
}

export function EpisodeEvents({ episodeNumber, mockBase, mockPrediction, mockDirect, edit }: EpisodeEventsProps) {
  const {
    leagueData: {
      baseEvents,
      leagueEvents,
      baseEventRules,
    }
  } = useLeague();

  if (!baseEvents[episodeNumber] && !leagueEvents.predictionEvents[episodeNumber] &&
    !leagueEvents.directEvents[episodeNumber] &&
    !mockBase && !mockPrediction && !mockDirect
  ) return (
    <div className='flex items-center justify-center h-48 text-muted-foreground' />
  );

  const noTribes = baseEvents[episodeNumber] &&
    !Object.values(baseEvents[episodeNumber]).some((event) => event.tribes.length > 0) &&
    !mockBase?.tribes &&
    !leagueEvents.predictionEvents[episodeNumber]?.some((event) => event.referenceType === 'Tribe') &&
    mockPrediction?.referenceType !== 'Tribe' &&
    !leagueEvents.directEvents[episodeNumber]?.Tribe.some((event) => event.referenceType === 'Tribe') && mockDirect?.referenceType !== 'Tribe';


  return (
    <ScrollArea className='max-md:w-[calc(100svw-4rem)] flex-grow bg-card rounded-lg gap-0'>
      <Table>
        <TableCaption className='sr-only'>Events from the previous episode</TableCaption>
        <TableHeader>
          <TableRow className='bg-white hover:bg-white px-4 gap-4 rounded-md items-center text-nowrap'>
            {edit && <TableHead className='w-0'>
              Edit
            </TableHead>}
            <TableHead className='w-0'>Event</TableHead>
            <TableHead className='text-center'>Points</TableHead>
            <TableHead className='w-0'>
              {noTribes ? null : 'Tribes'}
            </TableHead>
            <TableHead className='text-right w-0'>Castaways</TableHead>
            <TableHead>Members</TableHead>
            <TableHead className='text-right' >Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockBase && (
            <BaseEventRow
              className='bg-yellow-500'
              baseEvent={{ ...mockBase, baseEventId: -1 }}
              episodeNumber={episodeNumber}
              baseEventRules={baseEventRules}
              edit={false} />
          )}
          {mockPrediction && (
            <LeagueEventRow
              className='bg-yellow-500'
              eventName={mockPrediction.eventName}
              points={mockPrediction.points}
              referenceType={mockPrediction.referenceType}
              referenceName={mockPrediction.referenceName}
              predictionMaker={mockPrediction.predictionMaker}
              notes={mockPrediction.notes}
              edit={false} />
          )}
          {mockDirect && (
            <LeagueEventRow
              className='bg-yellow-500'
              eventName={mockDirect.eventName}
              points={mockDirect.points}
              referenceType={mockDirect.referenceType}
              referenceName={mockDirect.referenceName}
              notes={mockDirect.notes}
              edit={false} />
          )}
          {Object.values(baseEvents[episodeNumber] ?? {}).length > 0 &&
            <TableRow className='bg-gray-100 hover:bg-gray-200'>
              <TableCell colSpan={7} className='text-xs text-muted-foreground'>
                Official Events
              </TableCell>
            </TableRow>}
          {Object.entries(baseEvents[episodeNumber] ?? {})
            .map(([eventId, event]) => (
              <BaseEventRow
                key={eventId}
                baseEvent={event}
                episodeNumber={episodeNumber}
                baseEventRules={baseEventRules}
                edit={edit} />
            ))}
          {Object.values(leagueEvents.directEvents[episodeNumber] ?? {}).length > 0 &&
            <TableRow className='bg-gray-100 hover:bg-gray-200'>
              <TableCell colSpan={7} className='text-xs text-muted-foreground'>
                Custom Events
              </TableCell>
            </TableRow>}
          {Object.values(leagueEvents.directEvents[episodeNumber] ?? {}).map((directEvents) =>
            directEvents.map((event, index) => (
              <LeagueEventRow
                key={index}
                eventName={event.eventName}
                points={event.points}
                referenceType={event.referenceType}
                referenceName={event.referenceName}
                notes={event.notes}
                edit={edit} />
            ))
          )}
          {Object.values(leagueEvents.predictionEvents[episodeNumber] ?? {}).length > 0 &&
            <TableRow className='bg-gray-100 hover:bg-gray-200'>
              <TableCell colSpan={7} className='text-xs text-muted-foreground'>
                Correct Predictions
              </TableCell>
            </TableRow>}
          {leagueEvents.predictionEvents[episodeNumber]?.map((event, index) => (
            <LeagueEventRow
              key={index}
              eventName={event.eventName}
              points={event.points}
              referenceType={event.referenceType}
              referenceName={event.referenceName}
              predictionMaker={event.predictionMaker}
              notes={event.notes}
              edit={edit} />
          ))}
        </TableBody>
      </Table>
      <ScrollBar hidden orientation='horizontal' />
    </ScrollArea>
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
    <TableCell className={cn('text-sm text-muted-foreground text-center',
      points! > 0 ? 'text-green-600' : 'text-destructive')}>
      {points! > 0 ? `+${points}` : points}
    </TableCell>
  );
}

interface NotesPopoverProps {
  notes: string[] | null;
}

function NotesPopover({ notes }: NotesPopoverProps) {
  if (!notes || notes.length === 0) return (
    <span className='w-full flex justify-end'>
      <ScrollText className='stroke-muted-foreground/50' />
    </span>
  );

  return (
    <Popover>
      <PopoverTrigger className='ml-auto flex justify-end'>
        <ScrollText />
      </PopoverTrigger>
      <PopoverContent side='left'>
        <PopoverArrow />
        <ul>
          {notes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

type AirStatusProps = {
  airDate: Date;
  airStatus: EpisodeAirStatus;
};

function AirStatus({ airDate, airStatus }: AirStatusProps) {
  return (
    <span className='inline-flex -ml-1 gap-1 items-center text-sm text-muted-foreground'>
      {airDate.toLocaleDateString()}
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
}

function BaseEventRow({
  baseEvent, episodeNumber, baseEventRules, edit, className
}: BaseEventRowProps) {
  const { leagueData } = useLeague();
  const { eventName, label, tribes, castaways, notes } = baseEvent;

  const members =
    castaways?.map((castaway) =>
      leagueData.selectionTimeline.castawayMembers[castaway]?.slice(
        0, episodeNumber + 1).pop());

  return (
    <TableRow className={className}>
      {edit ? <TableCell className='w-0'>
        <EditBaseEvent episodeNumber={episodeNumber} baseEvent={baseEvent} />
      </TableCell> :
        edit === false ? <TableCell className='w-0' /> : null}
      <TableCell className='text-nowrap'>
        { // disable because we want label to be ignored if empty string as well as undefined
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          label || (`${baseEventLabelPrefixes[eventName]} ${baseEventLabels[eventName]?.[0] ?? eventName}`)}
      </TableCell>
      <PointsCell baseEventName={eventName} baseEventRules={baseEventRules} />
      <TableCell className='text-center' style={{ height: 'inherit' }}>
        <div className='h-full grid auto-rows-fr items-center'>
          {tribes?.map((tribe, index) => (
            <span key={index} className='flex h-full text-nowrap justify-center items-center'>
              {tribe}
            </span>
          ))}
        </div>
      </TableCell >
      <TableCell className='text-right'>
        <div
          className={cn(
            'text-xs flex flex-col h-full',
            castaways?.length === 1 && 'justify-center')}>
          {castaways?.map((castaway, index) => (
            <span className='text-nowrap' key={index}>{castaway}</span>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <div
          className={cn(
            'flex flex-col text-xs h-full',
            members?.length === 1 && 'justify-center')}>
          {members?.map((member, index) =>
            member ?
              <span key={index} className='text-nowrap'>
                {member}
              </span> :
              <br key={index} />
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
  points: number;
  referenceType: ReferenceType;
  referenceName: string;
  predictionMaker?: LeagueMemberDisplayName;
  notes: string[] | null;
  edit?: boolean;
}

function LeagueEventRow({
  eventName, points, referenceType, referenceName, predictionMaker, notes, edit, className
}: LeagueEventRowProps) {
  return (
    <TableRow className={className}>
      {edit && <TableCell className='w-0'>
        <AlertDialog>
          <AlertDialogTrigger>
            <Pencil size={20} />
          </AlertDialogTrigger>
          <AlertDialogContent className='bg-card rounded-lg overflow-y-auto min-w-max pb-0'>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Event</AlertDialogTitle>
              <AlertDialogDescription hidden>Edit the event details</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='h-min p-1'>
                <X stroke='white' />
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>}
      <TableCell className='text-nowrap sticky'>{eventName}</TableCell>
      <PointsCell points={points} />
      <TableCell className='text-right text-xs text-nowrap'>
        {referenceType === 'Tribe' ? referenceName : ''}
      </TableCell>
      <TableCell className='text-right text-xs text-nowrap'>
        {referenceType === 'Castaway' ? referenceName : ''}
      </TableCell>
      <TableCell className='text-xs text-nowrap'>
        {referenceType === 'Member' ? referenceName : ''}
        {predictionMaker &&
          <Popover>
            <PopoverTrigger>
              <b>{predictionMaker}</b>
            </PopoverTrigger>
            <PopoverContent className='w-min p-1 text-nowrap' side='left'>
              <PopoverArrow />
              Predicted {referenceName} correctly
            </PopoverContent>
          </Popover>}
      </TableCell>
      <TableCell>
        <NotesPopover notes={notes} />
      </TableCell>
    </TableRow>
  );
}
