import { Flame } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/app/_components/commonUI/hover';
import { getBaseEventsTimeline, getWeeklyEventsTimeline } from '~/app/api/leagues/[id]/events/timeline/query';
import { EventCard } from './eventCard';
import { Skeleton } from '~/app/_components/commonUI/skeleton';
import { getRules } from '~/app/api/leagues/[id]/events/query';

interface TimelineProps {
  leagueId: number;
}

export async function Timeline({ leagueId }: TimelineProps) {
  const [baseEventsTimeline, weeklyEventsTimeline, rules] = await Promise.all([
    getBaseEventsTimeline(leagueId),
    getWeeklyEventsTimeline(leagueId),
    getRules(leagueId),
  ]);

  weeklyEventsTimeline;

  return (
    <section className='flex flex-col gap-1 pt-2 w-svw'>
      <h1 className='text-2xl font-semibold'>Timeline</h1>
      {Object.entries(baseEventsTimeline).sort(([ep1], [ep2]) => parseInt(ep2) - parseInt(ep1))
        .map(([episode, events]) => (
          <article key={episode}>
            <h2 className='text-xl'>Episode {episode}</h2>
            <span className='flex overflow-x-auto gap-2 px-2 pb-1 md:px-14 light-scroll pad-scroll'>
              {events.soleSurvivor && <EventCard eventName='Sole Survivor' events={events.soleSurvivor} points={rules.soleSurvivor} />}
              {events.finalists && <EventCard eventName='Finalists' events={events.finalists} points={rules.finalists} />}
              {events.fireWin && <EventCard eventName='Fire Making Winner' events={events.fireWin} points={rules.fireWin} />}
              {events.elim && <EventCard eventName='Voted Out' events={events.elim}>
                {events.elim.map((event, index) => (
                  <HoverCard key={index}>
                    <HoverCardTrigger>
                      <h3 className='flex justify-center items-center px-1 text-base cursor-help text-nowrap'>
                        {event.reference.castaway ?? event.reference.tribe ?? 'NOT FOUND'} - {event.keywords.length}
                        <Flame className='ml-0.5 w-4 h-4' />
                      </h3>
                    </HoverCardTrigger>
                    <HoverCardContent className='py-0 px-1 w-min'>
                      <article className='flex flex-col gap-1'>
                        <h3 className='text-lg font-semibold'>Votes</h3>
                        {event.keywords.map((vote, index) => (
                          <p key={index} className='px-1 text-sm text-nowrap'>{vote}</p>
                        ))}
                      </article>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </EventCard>}
              {events.noVoteExit && <EventCard eventName='Left The Game' events={events.noVoteExit} />}
              {events.advElim && <EventCard eventName='Advantage Souvenir' events={events.advElim} points={rules.advElim} />}
              {events.advPlay && <EventCard eventName='Advantage Played' events={events.advPlay} points={rules.advPlay} />}
              {events.badAdvPlay && <EventCard eventName='Advantage Misplayed' events={events.badAdvPlay} points={rules.badAdvPlay} />}
              {events.advFound && <EventCard eventName='Advantage Found' events={events.advFound} points={rules.advFound} />}
              {events.spokeEpTitle && <EventCard eventName='Spoke Episode Title' events={events.spokeEpTitle} points={rules.spokeEpTitle} />}
              {events.indivWin && <EventCard eventName='Individual Immunity' events={events.indivWin} points={rules.indivWin} />}
              {events.indivReward && <EventCard eventName='Individual Reward' events={events.indivReward} points={rules.indivReward} />}
              {events.tribe1st && <EventCard eventName='Tribe Win' events={events.tribe1st} points={rules.tribe1st} />}
              {events.tribe2nd && <EventCard eventName='Tribe Runner Up' events={events.tribe2nd} points={rules.tribe2nd} />}
              {events.tribeUpdate && (
                <article className='p-1 rounded-md bg-b4'>
                  <h3 className='text-lg font-semibold'>{events.tribeUpdate[0]?.merge ? 'Merge' : 'Tribe Swap'}</h3>
                  <div className='overflow-y-auto max-h-24 min-w-32 overflow-x-clip dark-scroll'>
                    {Object.entries(events.tribeUpdate.reduce((tribes, update) => {
                      if (!update.reference.tribe && !update.reference.castaway) return tribes;
                      tribes[update.reference.tribe!] ??= [] as string[];
                      tribes[update.reference.tribe!]!.push(update.reference.castaway!);
                      return tribes;
                    }, {} as Record<string, string[]>)).map(([tribe, castaways], index) => (
                      <div key={index} className='px-1'>
                        <div className='sticky top-0 rounded-b-md bg-b4'>
                          <h4 className='text-xs font-semibold rounded-md bg-b3'>{tribe}</h4>
                        </div>
                        <div>
                          {castaways.map((castaway, index) => (
                            <p key={index} className='text-sm text-nowrap'>{castaway}</p>))}
                        </div>
                      </div>))}
                  </div>
                </article>)}
              {events.otherNotes && (
                <article className='p-1 rounded-md bg-b4'>
                  <h3 className='text-lg font-semibold'>Other Notes</h3>
                  <div className='overflow-y-auto max-h-24 min-w-80 overflow-x-clip md:min-w-96 dark-scroll'>
                    {Object.entries(events.otherNotes.reduce((notes, note) => {
                      const sameNote = notes.findIndex((noteEvent) => noteEvent.id === note.id);
                      if (sameNote === -1) notes.push(note);
                      else {
                        if (note.reference.castaway) {
                          notes[sameNote]!.reference.castaway ??= '';
                          notes[sameNote]!.reference.castaway += `, ${note.reference.castaway}`;
                        }
                        if (note.reference.tribe) {
                          notes[sameNote]!.reference.tribe ??= '';
                          notes[sameNote]!.reference.tribe += `, ${note.reference.tribe}`;
                        }
                      }
                      return notes;
                    }, [] as typeof events.otherNotes).reduce((notes, note) => {
                      const noteFor = note.reference.castaway ?? note.reference.tribe ?? 'NOT FOUND';
                      notes[noteFor] ??= [] as string[];
                      notes[noteFor].push(...note.notes);
                      return notes;
                    }, {} as Record<string, string[]>)).map(([names, texts]) => (
                      <div key={names} className='px-1 pt-0.5'>
                        <div className='sticky top-0 rounded-b-md bg-b4'>
                          <h4 className='px-2 mr-1 text-xs font-semibold rounded-md bg-b3 text-wrap'>
                            {names.split(', ').map((name, index) => (
                              <div key={index} className='inline-block ml-1 text-nowrap'>
                                {name}{!names.endsWith(name) && ','}
                              </div>))}
                          </h4>
                        </div>
                        <ul className='ml-4 list-disc'>
                          {texts.map((text, index) => (
                            <li key={index} className='text-sm text-left list-item'>
                              {text}
                            </li>))}
                        </ul>
                      </div>))}
                  </div>
                </article>)}
            </span>
          </article >))}
    </section >
  );
}

export function TimelineSkeleton() {
  return (
    <section className='flex flex-col gap-1 pt-2 w-svw'>
      <h1 className='text-2xl font-semibold'>Timeline</h1>
      <article>
        <h2 className='text-xl'>Episode</h2>
        <span className='flex overflow-x-auto gap-2 px-2 pb-1 md:px-14 light-scroll'>
          <Skeleton className='h-32 min-w-48' />
          <Skeleton className='h-32 min-w-64' />
          <Skeleton className='h-32 min-w-48' />
          <Skeleton className='h-32 min-w-48' />
          <Skeleton className='h-32 min-w-72' />
        </span>
      </article>
      <article>
        <h2 className='text-xl'>Episode</h2>
        <span className='flex overflow-x-auto gap-2 px-2 pb-1 md:px-14 light-scroll'>
          <Skeleton className='h-32 min-w-56' />
          <Skeleton className='h-32 min-w-48' />
          <Skeleton className='h-32 min-w-44' />
          <Skeleton className='h-32 min-w-72' />
        </span>
      </article>
      <article>
        <h2 className='text-xl'>Episode</h2>
        <span className='flex overflow-x-auto gap-2 px-2 pb-1 md:px-14 light-scroll'>
          <Skeleton className='h-32 min-w-48' />
          <Skeleton className='h-32 min-w-56' />
          <Skeleton className='h-32 min-w-72' />
          <Skeleton className='h-32 min-w-52' />
          <Skeleton className='h-32 min-w-80' />
        </span>
      </article>
    </section>
  );
}
