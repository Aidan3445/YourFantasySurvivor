import 'server-only';
import { and, asc, desc, eq, inArray, isNull, or } from 'drizzle-orm';
import { db } from '~/server/db';
import { getCastawayEvents, getTribeEvents, getTribeUpdates } from '~/app/api/seasons/[name]/events/query';
import { leagues } from '~/server/db/schema/leagues';
import { seasons } from '~/server/db/schema/seasons';
import { episodes } from '~/server/db/schema/episodes';
import { leagueMembers, selectionUpdates } from '~/server/db/schema/members';
import { castaways } from '~/server/db/schema/castaways';
import { customCastaways, customEventRules, customEvents, customMembers, customTribes } from '~/server/db/schema/customEvents';
import { tribes } from '~/server/db/schema/tribes';
import { weeklyCastawayResults, weeklyCastaways, weeklyEventRules, weeklyEvents, weeklyMemberResults, weeklyMembers, weeklyTribeResults, weeklyTribes } from '~/server/db/schema/weeklyEvents';
import { seasonCastawayResults, seasonCastaways, seasonEventRules, seasonEvents, seasonMemberResults, seasonMembers, seasonTribeResults, seasonTribes } from '~/server/db/schema/seasonEvents';
import { auth } from '@clerk/nextjs/server';

async function eventAuth(leagueId: number): Promise<{ userId?: string, memberId?: number }> {
  const { userId } = auth();
  if (!userId) return {};

  // ensure user is in the league
  const member = await db
    .select()
    .from(leagueMembers)
    .where(and(eq(leagueMembers.userId, userId), eq(leagueMembers.league, leagueId)))
    .then((res) => res[0]);

  return { userId, memberId: member?.id };
}

export async function getBaseEvents(leagueId: number) {
  const { memberId } = await eventAuth(leagueId);
  if (!memberId) throw new Error('Not authorized');

  const seasonName = await db
    .select({ seasonName: seasons.name })
    .from(seasons)
    .innerJoin(leagues, eq(leagues.season, seasons.id))
    .where(eq(leagues.id, leagueId))
    .then((res) => res[0]?.seasonName);

  if (!seasonName) throw new Error('League not found');

  const [castawayEvents, tribeEvents, tribeUpdates] = await Promise.all([
    getCastawayEvents(seasonName, null), getTribeEvents(seasonName, null), getTribeUpdates(seasonName),
  ]);

  return { castawayEvents, tribeEvents, tribeUpdates };
}

type Event = {
  episode: number;
  points: number;
  name: string;
  description: string;
  referenceType: string;
};

export interface AltEvents {
  castawayEvents: ({ castaway: string } & Event)[];
  tribeEvents: ({ tribe: string } & Event)[];
  memberEvents: ({ member: string } & Event)[];
}

export async function getCustomEvents(leagueId: number): Promise<AltEvents> {
  const { memberId } = await eventAuth(leagueId);
  if (!memberId) throw new Error('Not authorized');

  const events = await Promise.all([
    db
      .select({
        castaway: castaways.shortName,
        episode: episodes.number,
        points: customEventRules.points,
        name: customEventRules.name,
        description: customEventRules.description,
        referenceType: customEventRules.referenceType,
      })
      .from(customCastaways)
      .innerJoin(customEvents, eq(customEvents.id, customCastaways.event))
      .innerJoin(customEventRules, eq(customEventRules.id, customEvents.rule))
      .innerJoin(episodes, eq(episodes.id, customEvents.episode))
      .innerJoin(seasons, eq(seasons.id, episodes.season))
      .innerJoin(leagues, eq(leagues.season, seasons.id))
      .innerJoin(castaways, eq(castaways.id, customCastaways.reference))
      .where(eq(leagues.id, leagueId)),
    db
      .select({
        tribe: tribes.name,
        episode: episodes.number,
        points: customEventRules.points,
        name: customEventRules.name,
        description: customEventRules.description,
        referenceType: customEventRules.referenceType,
      })
      .from(customTribes)
      .innerJoin(customEvents, eq(customEvents.id, customTribes.event))
      .innerJoin(customEventRules, eq(customEventRules.id, customEvents.rule))
      .innerJoin(episodes, eq(episodes.id, customEvents.episode))
      .innerJoin(seasons, eq(seasons.id, episodes.season))
      .innerJoin(leagues, eq(leagues.season, seasons.id))
      .innerJoin(tribes, eq(tribes.id, customTribes.reference))
      .where(eq(leagues.id, leagueId)),
    db
      .select({
        member: leagueMembers.displayName,
        episode: episodes.number,
        points: customEventRules.points,
        name: customEventRules.name,
        description: customEventRules.description,
        referenceType: customEventRules.referenceType,
      })
      .from(customMembers)
      .innerJoin(customEvents, eq(customEvents.id, customMembers.event))
      .innerJoin(customEventRules, eq(customEventRules.id, customEvents.rule))
      .innerJoin(episodes, eq(episodes.id, customEvents.episode))
      .innerJoin(seasons, eq(seasons.id, episodes.season))
      .innerJoin(leagues, eq(leagues.season, seasons.id))
      .innerJoin(leagueMembers, eq(leagueMembers.id, customMembers.reference))
      .where(eq(leagues.id, leagueId)),
  ]);

  return { castawayEvents: events[0], tribeEvents: events[1], memberEvents: events[2] };
}

export async function getWeeklyEvents(leagueId: number): Promise<AltEvents> {
  const { memberId } = await eventAuth(leagueId);
  if (!memberId) throw new Error('Not authorized');

  // weekly events are split in two, 
  // * predictions always earn points for the member directly
  // * votes are mapped to the castaway or tribe and them to members in scoring
  const events = await Promise.all([
    // predictions
    db
      .select({
        member: leagueMembers.displayName,
        episode: episodes.number,
        points: weeklyEventRules.points,
        name: weeklyEventRules.name,
        description: weeklyEventRules.description,
        referenceType: weeklyEventRules.referenceType,
      })
      .from(weeklyCastawayResults)
      .innerJoin(weeklyEventRules, eq(weeklyEventRules.id, weeklyCastawayResults.rule))
      .innerJoin(weeklyEvents, eq(weeklyEvents.rule, weeklyEventRules.id))
      .innerJoin(weeklyCastaways, eq(weeklyCastaways.event, weeklyEvents.id))
      .innerJoin(leagueMembers, eq(leagueMembers.id, weeklyEvents.member))
      .innerJoin(episodes, eq(episodes.id, weeklyCastawayResults.episode))
      .innerJoin(seasons, eq(seasons.id, episodes.season))
      .innerJoin(leagues, eq(leagues.season, seasons.id))
      .where(and(
        eq(leagues.id, leagueId),
        eq(weeklyEventRules.type, 'predict'),
        eq(weeklyEventRules.referenceType, 'castaway'),
        eq(weeklyCastawayResults.episode, weeklyEvents.episode),
        eq(weeklyCastawayResults.result, weeklyCastaways.reference))),
    db
      .select({
        member: leagueMembers.displayName,
        episode: episodes.number,
        points: weeklyEventRules.points,
        name: weeklyEventRules.name,
        description: weeklyEventRules.description,
        referenceType: weeklyEventRules.referenceType,
      })
      .from(weeklyTribeResults)
      .innerJoin(weeklyEventRules, eq(weeklyEventRules.id, weeklyTribeResults.rule))
      .innerJoin(weeklyEvents, eq(weeklyEvents.rule, weeklyEventRules.id))
      .innerJoin(weeklyTribes, eq(weeklyTribes.event, weeklyEvents.id))
      .innerJoin(leagueMembers, eq(leagueMembers.id, weeklyEvents.member))
      .innerJoin(episodes, eq(episodes.id, weeklyTribeResults.episode))
      .innerJoin(seasons, eq(seasons.id, episodes.season))
      .innerJoin(leagues, eq(leagues.season, seasons.id))
      .where(and(
        eq(leagues.id, leagueId),
        eq(weeklyEventRules.type, 'predict'),
        eq(weeklyEventRules.referenceType, 'tribe'),
        eq(weeklyTribeResults.episode, weeklyEvents.episode),
        eq(weeklyTribeResults.result, weeklyTribes.reference))),
    db
      .select({
        member: leagueMembers.displayName,
        episode: episodes.number,
        points: weeklyEventRules.points,
        name: weeklyEventRules.name,
        description: weeklyEventRules.description,
        referenceType: weeklyEventRules.referenceType,
      })
      .from(weeklyMemberResults)
      .innerJoin(weeklyEventRules, eq(weeklyEventRules.id, weeklyMemberResults.rule))
      .innerJoin(weeklyEvents, eq(weeklyEvents.rule, weeklyEventRules.id))
      .innerJoin(weeklyMembers, eq(weeklyMembers.event, weeklyEvents.id))
      .innerJoin(leagueMembers, eq(leagueMembers.id, weeklyEvents.member))
      .innerJoin(episodes, eq(episodes.id, weeklyMemberResults.episode))
      .innerJoin(seasons, eq(seasons.id, episodes.season))
      .innerJoin(leagues, eq(leagues.season, seasons.id))
      .where(and(
        eq(leagues.id, leagueId),
        eq(weeklyEventRules.type, 'predict'),
        eq(weeklyEventRules.referenceType, 'member'),
        eq(weeklyMemberResults.episode, weeklyEvents.episode),
        eq(weeklyMemberResults.result, weeklyMembers.reference))),
    // votes
    db
      .select({
        castaway: castaways.shortName,
        episode: episodes.number,
        points: weeklyEventRules.points,
        name: weeklyEventRules.name,
        description: weeklyEventRules.description,
        referenceType: weeklyEventRules.referenceType,
      })
      .from(weeklyCastawayResults)
      .innerJoin(weeklyEventRules, eq(weeklyEventRules.id, weeklyCastawayResults.rule))
      .innerJoin(weeklyEvents, eq(weeklyEvents.rule, weeklyEventRules.id))
      .innerJoin(weeklyCastaways, eq(weeklyCastaways.event, weeklyEvents.id))
      .innerJoin(castaways, eq(castaways.id, weeklyCastawayResults.result))
      .innerJoin(episodes, eq(episodes.id, weeklyCastawayResults.episode))
      .innerJoin(seasons, eq(seasons.id, episodes.season))
      .innerJoin(leagues, eq(leagues.season, seasons.id))
      .where(and(
        eq(leagues.id, leagueId),
        eq(weeklyEventRules.type, 'vote'),
        eq(weeklyEventRules.referenceType, 'castaway'),
        eq(weeklyCastawayResults.episode, weeklyEvents.episode),
        eq(weeklyCastawayResults.result, weeklyCastaways.reference))),
    db
      .select({
        tribe: tribes.name,
        episode: episodes.number,
        points: weeklyEventRules.points,
        name: weeklyEventRules.name,
        description: weeklyEventRules.description,
        referenceType: weeklyEventRules.referenceType,
      })
      .from(weeklyTribeResults)
      .innerJoin(weeklyEventRules, eq(weeklyEventRules.id, weeklyTribeResults.rule))
      .innerJoin(weeklyEvents, eq(weeklyEvents.rule, weeklyEventRules.id))
      .innerJoin(weeklyTribes, eq(weeklyTribes.event, weeklyEvents.id))
      .innerJoin(tribes, eq(tribes.id, weeklyTribeResults.result))
      .innerJoin(episodes, eq(episodes.id, weeklyTribeResults.episode))
      .innerJoin(seasons, eq(seasons.id, episodes.season))
      .innerJoin(leagues, eq(leagues.season, seasons.id))
      .where(and(
        eq(leagues.id, leagueId),
        eq(weeklyEventRules.type, 'vote'),
        eq(weeklyEventRules.referenceType, 'tribe'),
        eq(weeklyTribeResults.episode, weeklyEvents.episode),
        eq(weeklyTribeResults.result, weeklyTribes.reference))),
    db
      .select({
        member: leagueMembers.displayName,
        episode: episodes.number,
        points: weeklyEventRules.points,
        name: weeklyEventRules.name,
        description: weeklyEventRules.description,
        referenceType: weeklyEventRules.referenceType,
      })
      .from(weeklyMemberResults)
      .innerJoin(weeklyEventRules, eq(weeklyEventRules.id, weeklyMemberResults.rule))
      .innerJoin(weeklyEvents, eq(weeklyEvents.rule, weeklyEventRules.id))
      .innerJoin(weeklyMembers, eq(weeklyMembers.event, weeklyEvents.id))
      .innerJoin(leagueMembers, eq(leagueMembers.id, weeklyMemberResults.result))
      .innerJoin(episodes, eq(episodes.id, weeklyMemberResults.episode))
      .innerJoin(seasons, eq(seasons.id, episodes.season))
      .innerJoin(leagues, eq(leagues.season, seasons.id))
      .where(and(
        eq(leagues.id, leagueId),
        eq(weeklyEventRules.type, 'vote'),
        eq(weeklyEventRules.referenceType, 'member'),
        eq(weeklyMemberResults.episode, weeklyEvents.episode),
        eq(weeklyMemberResults.result, weeklyMembers.reference))),
  ]);

  return {
    castawayEvents: events[3],
    tribeEvents: events[4],
    memberEvents: [...events[0], ...events[1], ...events[2], ...events[5]]
  };
}

export async function getSeasonEvents(leagueId: number): Promise<AltEvents> {
  const { memberId } = await eventAuth(leagueId);
  if (!memberId) throw new Error('Not authorized');

  // season events are all predictions and get mapped directly to members
  const events = await Promise.all([
    db
      .select({
        member: leagueMembers.displayName,
        episode: episodes.number,
        points: seasonEventRules.points,
        name: seasonEventRules.name,
        description: seasonEventRules.description,
        referenceType: seasonEventRules.referenceType,
      })
      .from(seasonCastawayResults)
      .innerJoin(seasonEventRules, eq(seasonEventRules.id, seasonCastawayResults.rule))
      .innerJoin(seasonEvents, eq(seasonEvents.rule, seasonEventRules.id))
      .innerJoin(seasonCastaways, eq(seasonCastaways.event, seasonEvents.id))
      .innerJoin(leagueMembers, eq(leagueMembers.id, seasonEvents.member))
      .innerJoin(episodes, eq(episodes.id, seasonCastawayResults.episode))
      .innerJoin(seasons, eq(seasons.id, episodes.season))
      .innerJoin(leagues, eq(leagues.season, seasons.id))
      .where(and(
        eq(leagues.id, leagueId),
        eq(seasonEventRules.referenceType, 'castaway'),
        eq(seasonCastawayResults.result, seasonCastaways.reference))),
    db
      .select({
        member: leagueMembers.displayName,
        episode: episodes.number,
        points: seasonEventRules.points,
        name: seasonEventRules.name,
        description: seasonEventRules.description,
        referenceType: seasonEventRules.referenceType,
      })
      .from(seasonTribeResults)
      .innerJoin(seasonEventRules, eq(seasonEventRules.id, seasonTribeResults.rule))
      .innerJoin(seasonEvents, eq(seasonEvents.rule, seasonEventRules.id))
      .innerJoin(seasonTribes, eq(seasonTribes.event, seasonEvents.id))
      .innerJoin(leagueMembers, eq(leagueMembers.id, seasonEvents.member))
      .innerJoin(episodes, eq(episodes.id, seasonTribeResults.episode))
      .innerJoin(seasons, eq(seasons.id, episodes.season))
      .innerJoin(leagues, eq(leagues.season, seasons.id))
      .where(and(
        eq(leagues.id, leagueId),
        eq(seasonEventRules.referenceType, 'tribe'),
        eq(seasonTribeResults.result, seasonTribes.reference))),
    db
      .select({
        member: leagueMembers.displayName,
        episode: episodes.number,
        points: seasonEventRules.points,
        name: seasonEventRules.name,
        description: seasonEventRules.description,
        referenceType: seasonEventRules.referenceType,
      })
      .from(seasonMemberResults)
      .innerJoin(seasonEventRules, eq(seasonEventRules.id, seasonMemberResults.rule))
      .innerJoin(seasonEvents, eq(seasonEvents.rule, seasonEventRules.id))
      .innerJoin(seasonMembers, eq(seasonMembers.event, seasonEvents.id))
      .innerJoin(leagueMembers, eq(leagueMembers.id, seasonEvents.member))
      .innerJoin(episodes, eq(episodes.id, seasonMemberResults.episode))
      .innerJoin(seasons, eq(seasons.id, episodes.season))
      .innerJoin(leagues, eq(leagues.season, seasons.id))
      .where(and(
        eq(leagues.id, leagueId),
        eq(seasonEventRules.referenceType, 'member'),
        eq(seasonMemberResults.result, seasonMembers.reference))),
  ]);

  return { castawayEvents: [], tribeEvents: [], memberEvents: events.flat() };
}

export async function getCastawayMemberEpisodeTable(memberIds: number[]) {
  const { userId } = auth();
  if (!userId) throw new Error('Not authorized');

  const updates = await db
    .select({
      episode: episodes.number,
      member: leagueMembers.displayName,
      castaway: castaways.shortName,
      id: leagueMembers.userId
    })
    .from(selectionUpdates)
    .innerJoin(leagueMembers, eq(leagueMembers.id, selectionUpdates.member))
    .innerJoin(castaways, eq(castaways.id, selectionUpdates.castaway))
    .leftJoin(episodes, eq(episodes.id, selectionUpdates.episode))
    .where(inArray(leagueMembers.id, memberIds));

  if (!updates.some((update) => update.id === userId)) throw new Error('Not authorized');

  return updates.reduce((lookup, update) => {
    update.episode ??= 0;
    lookup[update.episode] ??= {};

    // initial castaway selection has null episode, replace with 0
    lookup[update.episode]![update.castaway] = update.member;

    return lookup;
  }, {} as Record<number, Record<string, string>>);
}

export async function getEpisodes(leagueId: number) {
  const eps = await db
    .select({ id: episodes.id, number: episodes.number, title: episodes.title, airDate: episodes.airDate })
    .from(episodes)
    .innerJoin(seasons, eq(seasons.id, episodes.season))
    .innerJoin(leagues, eq(leagues.season, seasons.id))
    .where(eq(leagues.id, leagueId))
    .orderBy(desc(episodes.number));

  return eps.filter((ep) => new Date(`${ep.airDate} -5:00`) < new Date());
}

export async function getMemberEpisodeEvents(leagueId: number) {
  const { memberId } = await eventAuth(leagueId);
  if (!memberId) throw new Error('Not authorized');

  const { currentEpisode, nextEpisode } = await db
    .select({
      episode: episodes.number,
      airDate: episodes.airDate,
      runtime: episodes.runtime,
      merge: episodes.merge,
      finale: episodes.finale,
    })
    .from(episodes)
    .innerJoin(seasons, eq(seasons.id, episodes.season))
    .innerJoin(leagues, eq(leagues.season, seasons.id))
    .where(eq(leagues.id, leagueId))
    .orderBy(asc(episodes.number))
    .then((res) => ({
      currentEpisode: res.reverse().find((ep) => new Date(`${ep.airDate} -5:00`) < new Date()),
      nextEpisode: res.find((ep) => new Date(`${ep.airDate} -5:00`) > new Date()),
    }));

  if (!currentEpisode) return {
    weekly: { votes: [], predictions: [] },
    season: []
  };

  // get votes for the current episode that this member has not yet scored
  const votes = await db
    .select({
      name: weeklyEventRules.name,
      description: weeklyEventRules.description,
      points: weeklyEventRules.points,
      referenceType: weeklyEventRules.referenceType,
    })
    .from(weeklyEventRules)
    .leftJoin(weeklyEvents, and(
      eq(weeklyEvents.rule, weeklyEventRules.id),
      eq(weeklyEvents.member, memberId),
      eq(weeklyEvents.episode, currentEpisode.episode)))
    .where(and(
      eq(weeklyEventRules.league, leagueId),
      eq(weeklyEventRules.type, 'vote'),
      isNull(weeklyEvents.id)));

  // only if the next episode is available
  // and the current episode is done airing
  if (!nextEpisode || new Date(new Date(
    `${currentEpisode.airDate} -5:00`).getTime() + currentEpisode.runtime * 60 * 1000
  ) > new Date()) return {
    weekly: { votes, predictions: [] },
    season: []
  };

  // get predictions for the next episode
  const predictions = await db
    .select({
      name: weeklyEventRules.name,
      description: weeklyEventRules.description,
      points: weeklyEventRules.points,
      referenceType: weeklyEventRules.referenceType,
    })
    .from(weeklyEventRules)
    .leftJoin(weeklyEvents, and(
      eq(weeklyEvents.rule, weeklyEventRules.id),
      eq(weeklyEvents.member, memberId),
      eq(weeklyEvents.episode, nextEpisode.episode)))
    .where(and(
      eq(weeklyEventRules.league, leagueId),
      eq(weeklyEventRules.type, 'predict'),
      isNull(weeklyEvents.id)));

  // if the next episode is a merge or finale
  // get relevant season predictions
  if (nextEpisode.merge || nextEpisode.finale) {
    const seasonPredictions = await db
      .select({
        name: seasonEventRules.name,
        description: seasonEventRules.description,
        points: seasonEventRules.points,
        referenceType: seasonEventRules.referenceType,
        timing: seasonEventRules.timing,
      })
      .from(seasonEventRules)
      .leftJoin(seasonEvents, and(
        eq(seasonEvents.rule, seasonEventRules.id),
        eq(seasonEvents.member, memberId)))
      .where(and(
        eq(seasonEventRules.league, leagueId),
        or(
          eq(seasonEventRules.timing, 'merge'),
          eq(seasonEventRules.timing, 'finale')),
        isNull(seasonEvents.id)))
      .then((res) => res.filter((rule) => rule.timing === (nextEpisode.merge ? 'merge' : 'finale')));

    return {
      weekly: { votes, predictions },
      season: seasonPredictions
    };
  } else {
    return {
      weekly: { votes, predictions },
      season: []
    };
  }
}
