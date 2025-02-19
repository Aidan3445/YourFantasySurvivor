'use client';

import { PopoverArrow } from '@radix-ui/react-popover';
import { ScrollText } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { ScrollArea, ScrollBar } from '~/components/ui/scrollArea';
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
import { type EpisodeAirStatus } from '~/server/db/defs/episodes';
import { type BaseEventName, type BaseEventRule, type ScoringBaseEventName, ScoringBaseEventNames } from '~/server/db/defs/events';

export default function RecentActivity() {
  const {
    leagueData: {
      episodes,
      baseEvents,
      selectionTimeline,
      leagueEvents,
      baseEventRules
    }
  } = useLeague();

  const latestEpisode = episodes[1];

  return (
    <section className='md:w-full bg-card rounded-lg relative'>
      <Button className='absolute top-2 right-2 text-xs px-1 h-4' variant='secondary'>View All</Button>
      <span className='flex flex-wrap gap-x-4 items-baseline px-2 mr-14'>
        <h2 className='text-lg font-bold text-card-foreground'>Recent Events</h2>
        {latestEpisode && <span className='inline-flex gap-4 flex-nowrap'>
          <p className='text-sm text-muted-foreground'>
            {`${latestEpisode.episodeNumber}:`} {latestEpisode.episodeTitle}
          </p>
          <AirStatus airDate={latestEpisode.episodeAirDate} airStatus={latestEpisode.airStatus} />
        </span>}
      </span>
      {latestEpisode && (
        <ScrollArea className='max-md:w-[calc(100svw-4rem)]'>
          <Table>
            <TableCaption className='sr-only'>Events from the previous episode</TableCaption>
            <TableHeader>
              <TableRow className='bg-white px-4 gap-4 rounded-md items-center text-nowrap'>
                <TableHead className='rounded-tl-md w-0'>Event</TableHead>
                <TableHead>Points</TableHead>
                <TableHead className='w-0'>Tribes</TableHead>
                <TableHead className='text-right w-0'>Castaways</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className='rounded-tr-md text-right' >Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(baseEvents[latestEpisode.episodeNumber] ?? {})
                .map(([eventId, event]) => (
                  <TableRow key={eventId}>
                    <TableCell>{event.eventName}</TableCell>
                    <PointsCell baseEventName={event.eventName} baseEventRules={baseEventRules} />
                    <TableCell>
                      <div className='text-sm flex flex-col h-full justify-start'>
                        {event.tribes.map((tribe) => (
                          <span key={tribe}>{tribe}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className='text-right align-top'>
                      <div className='text-xs flex flex-col h-full justify-start'>
                        {event.castaways.map((ct) => (
                          <span className='text-nowrap' key={ct}>{ct}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className='flex flex-col text-xs'>
                      {event.castaways.map((castaway) => (
                        <span key={castaway} className='text-nowrap'>
                          {selectionTimeline.castawayMembers[castaway]?.slice(0, latestEpisode.episodeNumber).pop() ?? '-----'}
                        </span>
                      ))}
                    </TableCell>
                    <TableCell>
                      <NotesPopover notes={event.notes} />
                    </TableCell>
                  </TableRow>
                ))}
              {leagueEvents.predictionEvents[latestEpisode.episodeNumber]?.map((event, index) => (
                <TableRow key={index}>
                  <TableCell>{event.eventName}</TableCell>
                  <PointsCell points={event.points} />
                  <TableCell className='text-right text-xs'>
                    {event.referenceType === 'Tribe' ? event.referenceName : ''}
                  </TableCell>
                  <TableCell className='text-right text-xs'>
                    {event.referenceType === 'Castaway' ? event.referenceName : ''}
                  </TableCell>
                  <TableCell className='text-xs'>
                    {event.referenceType === 'Member' ? event.referenceName : ''}
                    {event.predictionMaker}
                  </TableCell>
                  <TableCell>
                    <NotesPopover notes={event.notes} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>
      )}
    </section >
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
    return <TableCell className='text-xs text-muted-foreground'>N/A</TableCell>;

  points ??= baseEventRules?.[eventName as ScoringBaseEventName];

  return (
    <TableCell className={cn('text-sm text-muted-foreground',
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
      <PopoverTrigger className='w-full flex justify-end'>
        <ScrollText />
      </PopoverTrigger>
      <PopoverContent side='left'>
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
