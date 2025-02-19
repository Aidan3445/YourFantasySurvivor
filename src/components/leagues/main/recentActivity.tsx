'use client';

import { ScrollText } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
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

  console.log(leagueEvents);

  const latestEpisode = episodes[1];

  return (
    <section className='w-full p-2 bg-card rounded-lg'>
      <span className='inline-flex gap-2 items-center'>
        <h2 className='text-lg font-bold text-card-foreground'>Recent Events</h2>
        {latestEpisode && <>
          <p className='text-sm text-muted-foreground'>
            {latestEpisode.episodeNumber} - {latestEpisode.episodeTitle} -
          </p>
          <AirStatus airDate={latestEpisode.episodeAirDate} airStatus={latestEpisode.airStatus} />
        </>}
      </span>
      {latestEpisode && (
        <Table>
          <TableCaption className='sr-only'>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow className='bg-white px-4 gap-4 rounded-md items-center text-nowrap'>
              <TableHead className=' rounded-tl-md'>Event</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Castaways/Tribes</TableHead>
              <TableHead>Members</TableHead>
              <TableHead className='rounded-tr-md' >Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(baseEvents[latestEpisode.episodeNumber] ?? {})
              .map(([eventId, event]) => (
                <TableRow key={eventId}>
                  <TableCell>{event.eventName}</TableCell>
                  <PointsCell eventName={event.eventName} baseEventRules={baseEventRules} />
                  <TableCell>
                    <div className='text-xs flex flex-col'>
                      {event.castaways.concat(event.tribes).map((ct) => (
                        <span className='text-nowrap' key={ct}>{ct}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-xs flex flex-col'>
                      {event.castaways.map((castaway) => (
                        <span key={castaway} className='text-nowrap'>
                          {selectionTimeline.castawayMembers[castaway]?.slice(0, latestEpisode.episodeNumber).pop()}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className=''>
                    <NotesPopover notes={event.notes} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}
    </section >
  );
}

interface EventRowProps {
  eventName: BaseEventName;
  baseEventRules: BaseEventRule;
}

function PointsCell({ eventName, baseEventRules }: EventRowProps) {
  if (!ScoringBaseEventNames.includes(eventName as ScoringBaseEventName))
    return <TableCell className='text-xs text-muted-foreground'>N/A</TableCell>;

  const points = baseEventRules[eventName as ScoringBaseEventName];

  return (
    <TableCell className={cn('text-sm text-muted-foreground',
      points > 0 ? 'text-green-600' : 'text-destructive-foreground')}>
      {points > 0 ? `+${points}` : `-${points}`}
    </TableCell>
  );
}

interface NotesPopoverProps {
  notes: string[] | null;
}

function NotesPopover({ notes }: NotesPopoverProps) {
  if (!notes || notes.length === 0) return (
    <span className='w-full flex justify-center'>
      <ScrollText className='stroke-muted-foreground/50' />
    </span>
  );

  return (
    <Popover>
      <PopoverTrigger className='w-full flex justify-center'>
        <ScrollText />
      </PopoverTrigger>
      <PopoverContent>
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
    <span className='inline-flex gap-1 items-center text-sm text-muted-foreground'>
      {airDate.toDateString()}
      <div className={cn('text-destructive-foreground text-xs px-1 rounded-md',
        airStatus === 'Aired' && 'bg-destructive',
        airStatus === 'Upcoming' && 'bg-amber-500',
        airStatus === 'Airing' && 'bg-green-600')}>
        {airStatus}
      </div>
    </span>
  );
}
