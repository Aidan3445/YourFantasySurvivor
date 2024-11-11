import { Flame } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/app/_components/commonUI/hover';
import { getBaseEventsTimeline } from '~/app/api/leagues/[id]/events/timeline/query';

interface TimelineProps {
  leagueId: number;
}

export async function Timeline({ leagueId }: TimelineProps) {
  const [baseEventsTimeline] = await Promise.all([
    getBaseEventsTimeline(leagueId),
  ]);

  return (
    <section className='flex flex-col gap-1 pt-2 w-svw'>
      <h1 className='text-2xl font-semibold'>Timeline</h1>
      {Object.entries(baseEventsTimeline).sort(([ep1], [ep2]) => parseInt(ep2) - parseInt(ep1))
        .map(([episode, events]) => (
          <article key={episode}>
            <h2 className='text-xl'>Episode {episode}</h2>
            <span className='flex gap-2 px-2 md:px-14 overflow-x-auto light-scroll pb-1'>
              {events.soleSurvivor && <EventCard eventName='Sole Survivor' events={events.soleSurvivor} />}
              {events.finalists && <EventCard eventName='Finalists' events={events.finalists} />}
              {events.fireWin && <EventCard eventName='Fire Making Winner' events={events.fireWin} />}
              {events.elim?.map((event, index) => (
                <article key={index} className='p-1 rounded-md bg-b4'>
                  <h3 className='text-lg font-semibold'>Voted Out</h3>
                  <HoverCard>
                    <HoverCardTrigger>
                      <h3 className='text-base flex items-center justify-center cursor-help text-nowrap px-1'>
                        {event.reference.castaway ?? event.reference.tribe ?? 'NOT FOUND'} - {event.keywords.length}
                        <Flame className='w-4 h-4 ml-0.5' />
                      </h3>
                    </HoverCardTrigger>
                    <HoverCardContent className='w-min px-1 py-0'>
                      <article className='flex flex-col gap-1'>
                        <h3 className='text-lg font-semibold'>Votes</h3>
                        {event.keywords.map((vote, index) => (
                          <p key={index} className='text-sm text-nowrap px-1'>{vote}</p>
                        ))}
                      </article>
                    </HoverCardContent>
                  </HoverCard>
                </article>
              ))}
              {events.noVoteExit && <EventCard eventName='Left The Game' events={events.noVoteExit} />}
              {events.advElim && <EventCard eventName='Advantage Souvenir' events={events.advElim} />}
              {events.advPlay && <EventCard eventName='Advantage Played' events={events.advPlay} />}
              {events.badAdvPlay && <EventCard eventName='Advantage Misplayed' events={events.badAdvPlay} />}
              {events.advFound && <EventCard eventName='Advantage Found' events={events.advFound} />}
              {events.spokeEpTitle && <EventCard eventName='Spoke Episode Title' events={events.spokeEpTitle} />}
              {events.indivWin && <EventCard eventName='Individual Immunity' events={events.indivWin} />}
              {events.indivReward && <EventCard eventName='Individual Reward' events={events.indivReward} />}
              {events.tribe1st && <EventCard eventName='Tribe Win' events={events.tribe1st} />}
              {events.tribe2nd && <EventCard eventName='Tribe Runner Up' events={events.tribe2nd} />}
              {events.tribeUpdate && (
                <article className='p-1 rounded-md bg-b4'>
                  <h3 className='text-lg font-semibold'>{events.tribeUpdate[0]?.merge ? 'Merge' : 'Tribe Swap'}</h3>
                  <div className='max-h-24 min-w-32 overflow-y-auto dark-scroll overflow-x-clip'>
                    {Object.entries(events.tribeUpdate.reduce((tribes, update) => {
                      if (!update.reference.tribe && !update.reference.castaway) return tribes;
                      tribes[update.reference.tribe!] ??= [] as string[];
                      tribes[update.reference.tribe!]!.push(update.reference.castaway!);
                      return tribes;
                    }, {} as Record<string, string[]>)).map(([tribe, castaways], index) => (
                      <div key={index} className='px-1'>
                        <div className='sticky top-0 bg-b4 rounded-b-md'>
                          <h4 className='text-xs font-semibold bg-b3 rounded-md'>{tribe}</h4>
                        </div>
                        <div>
                          {castaways.map((castaway, index) => (
                            <p key={index} className='text-sm text-nowrap'>{castaway}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>)}
              {events.otherNotes && (
                <article className='p-1 rounded-md bg-b4'>
                  <h3 className='text-lg font-semibold'>Other Notes</h3>
                  <div className='max-h-24 min-w-80 md:min-w-96 overflow-y-auto dark-scroll overflow-x-clip'>
                    {Object.entries(events.otherNotes.reduce((notes, note) => {
                      const noteFor = note.reference.castaway ?? note.reference.tribe ?? 'NOT FOUND';
                      notes[noteFor] ??= [] as string[];
                      notes[noteFor].push(...note.notes);
                      return notes;
                    }, {} as Record<string, string[]>)).map(([name, texts]) => (
                      <div key={name} className='px-1'>
                        <div className='sticky top-0 bg-b4 rounded-b-md'>
                          <h4 className='text-xs font-semibold bg-b3 rounded-md'>{name}</h4>
                        </div>
                        <ul className='marker:text-black list-outside list-disc'>
                          {texts.map((text, index) => (
                            <li key={index} className='text-sm'>{text}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </article>)}
            </span>
          </article >))
      }
    </section >
  );
}

interface EventCardProps {
  eventName: string;
  events: { reference: { castaway: string | null, tribe: string | null } }[];
  castaway?: boolean;
  tribe?: boolean;
}

function EventCard({ eventName, events, castaway = true, tribe = true }: EventCardProps) {
  return (
    <article className='p-1 rounded-md bg-b4'>
      <h3 className='text-lg font-semibold text-nowrap'>{eventName}</h3>
      <div className='max-h-24 min-w-32 overflow-y-auto dark-scroll overflow-x-clip'>
        {events.map((event, index) => (
          <p key={index} className='text-sm text-nowrap px-1'>
            {(castaway ? event.reference.castaway : null) ??
              (tribe ? event.reference.tribe : 'NOT FOUND')}
          </p>
        ))}
      </div>
    </article>
  );
}

/*

      {baseEventsTimeline.map((event, index) => (
        <div>
        {(index === 0 || baseEventsTimeline[index - 1]?.episode 
        <article key={index} className={cn('p-1 rounded-md', index % 2 === 0 ? 'bg-b2' : 'bg-b4')}>
          <h2 className='text-lg font-semibold'>{event.name}</h2>
          <h3 className='text-base font-semibold'>
            {event.reference.castaway ?? event.reference.tribe ?? 'NOT FOUND'}
          </h3>
          <div className='flex flex-col gap-1'>
            {event.notes.map((note, index) => (
              <p key={index} className='text-sm'>{note}</p>
            ))}
          </div>
        </article>))}
        */
