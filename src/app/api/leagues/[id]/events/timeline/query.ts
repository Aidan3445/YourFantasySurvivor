import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { castaways } from '~/server/db/schema/castaways';
import { baseEventCastaways, baseEvents, baseEventTribes, episodes, type EventName } from '~/server/db/schema/episodes';
import { leagues } from '~/server/db/schema/leagues';
import { tribes } from '~/server/db/schema/tribes';
import { getWeeklyEventsRaw, leagueMemberAuth } from '../../score/query';
//import { weeklyEventRules } from '~/server/db/schema/weeklyEvents';
//import { leagueMembers } from '~/server/db/schema/members';

export async function getBaseEventsTimeline(leagueId: number) {
  const { memberId } = await leagueMemberAuth(leagueId);
  if (!memberId) return {};

  return await db
    .select({
      episode: episodes.number,
      title: episodes.title,
      merge: episodes.merge,
      name: baseEvents.eventName,
      keywords: baseEvents.keywords,
      notes: baseEvents.notes,
      reference: {
        castaway: castaways.name,
        tribe: tribes.name,
      },
      id: baseEvents.id,
    })
    .from(baseEvents)
    .innerJoin(episodes, eq(episodes.id, baseEvents.episode))
    .innerJoin(leagues, eq(leagues.season, episodes.season))
    .leftJoin(baseEventCastaways, eq(baseEventCastaways.event, baseEvents.id))
    .leftJoin(castaways, eq(castaways.id, baseEventCastaways.reference))
    .leftJoin(baseEventTribes, eq(baseEventTribes.event, baseEvents.id))
    .leftJoin(tribes, eq(tribes.id, baseEventTribes.reference))
    .where(eq(leagues.id, leagueId))
    .then((events) => events.reduce((timeline, event) => {
      const episodeId = `${event.episode} - ${event.title}`;
      timeline[episodeId] ??= {} as Record<string, typeof events>;
      timeline[episodeId][event.name] ??= [] as typeof events;
      timeline[episodeId][event.name].push(event);
      return timeline;
    }, {} as Record<string, Record<EventName, typeof events>>));
}

export async function getWeeklyEventsTimeline(leagueId: number) {
  const events = await getWeeklyEventsRaw(leagueId);

  //const votes = [...events.castawayVotes, ...events.tribeVotes, ...events.memberVotes];

  //console.log(events);
  return events;
}
