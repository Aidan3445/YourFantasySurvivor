import 'server-only';
import { and, count, desc, eq, inArray, isNull, lt, or } from 'drizzle-orm';
import { db } from '~/server/db';
import { getCastawayEvents, getTribeEvents, getTribeUpdates } from '~/app/api/seasons/[name]/events/query';
import { leagues } from '~/server/db/schema/leagues';
import { seasons } from '~/server/db/schema/seasons';
import { episodes } from '~/server/db/schema/episodes';
import { leagueMembers, selectionUpdates } from '~/server/db/schema/members';
import { castaways } from '~/server/db/schema/castaways';
import { customCastaways, customEventRules, customEvents, customMembers, customTribes } from '~/server/db/schema/customEvents';
import { tribes } from '~/server/db/schema/tribes';
import { weeklyCastawayResults, weeklyCastaways, weeklyEventRules, type WeeklyEventRuleType, weeklyEvents, weeklyMemberResults, weeklyMembers, weeklyTribeResults, weeklyTribes } from '~/server/db/schema/weeklyEvents';
import { seasonCastawayResults, seasonCastaways, seasonEventRules, type SeasonEventRuleType, seasonEvents, seasonMemberResults, seasonMembers, seasonTribeResults, seasonTribes } from '~/server/db/schema/seasonEvents';
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
  referenceType: 'castaway' | 'tribe' | 'member';
  timing?: 'fullSeason' | 'preMerge' | 'postMerge';
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

  const { currentEpisode, mergeEpisode } = await getCurrentNextEpisodes(leagueId);

  if (!currentEpisode) return {
    castawayEvents: [],
    tribeEvents: [],
    memberEvents: [],
  };

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
        timing: weeklyEventRules.timing,
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
        eq(weeklyCastawayResults.result, weeklyCastaways.reference)))
      .then((res) => filterWeeklyEventsTiming(res, currentEpisode, mergeEpisode)),
    db
      .select({
        member: leagueMembers.displayName,
        episode: episodes.number,
        points: weeklyEventRules.points,
        name: weeklyEventRules.name,
        description: weeklyEventRules.description,
        referenceType: weeklyEventRules.referenceType,
        timing: weeklyEventRules.timing,
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
        eq(weeklyTribeResults.result, weeklyTribes.reference)))
      .then((res) => filterWeeklyEventsTiming(res, currentEpisode, mergeEpisode)),
    db
      .select({
        member: leagueMembers.displayName,
        episode: episodes.number,
        points: weeklyEventRules.points,
        name: weeklyEventRules.name,
        description: weeklyEventRules.description,
        referenceType: weeklyEventRules.referenceType,
        timing: weeklyEventRules.timing,
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
        eq(weeklyMemberResults.result, weeklyMembers.reference)))
      .then((res) => filterWeeklyEventsTiming(res, currentEpisode, mergeEpisode)),
    // votes
    db
      .select({
        count: count(),
        castaway: castaways.shortName,
        episode: episodes.number,
        points: weeklyEventRules.points,
        name: weeklyEventRules.name,
        description: weeklyEventRules.description,
        referenceType: weeklyEventRules.referenceType,
        timing: weeklyEventRules.timing,
        id: weeklyEventRules.id,
      })
      .from(weeklyCastaways)
      .innerJoin(weeklyEvents, eq(weeklyEvents.id, weeklyCastaways.event))
      .innerJoin(weeklyEventRules, eq(weeklyEventRules.id, weeklyEvents.rule))
      .innerJoin(castaways, eq(castaways.id, weeklyCastaways.reference))
      .innerJoin(episodes, eq(episodes.id, weeklyEvents.episode))
      .innerJoin(seasons, eq(seasons.id, episodes.season))
      .innerJoin(leagues, eq(leagues.season, seasons.id))
      .where(and(
        eq(leagues.id, leagueId),
        eq(weeklyEventRules.type, 'vote'),
        eq(weeklyEventRules.referenceType, 'castaway'),
        lt(episodes.number, currentEpisode?.episode ?? -1)))
      .groupBy(castaways.shortName, episodes.number, weeklyEventRules.id),
    db
      .select({
        count: count(),
        tribe: tribes.name,
        episode: episodes.number,
        points: weeklyEventRules.points,
        name: weeklyEventRules.name,
        description: weeklyEventRules.description,
        referenceType: weeklyEventRules.referenceType,
        timing: weeklyEventRules.timing,
        id: weeklyEventRules.id,
      })
      .from(weeklyTribes)
      .innerJoin(weeklyEvents, eq(weeklyEvents.id, weeklyTribes.event))
      .innerJoin(weeklyEventRules, eq(weeklyEventRules.id, weeklyEvents.rule))
      .innerJoin(tribes, eq(tribes.id, weeklyTribes.reference))
      .innerJoin(episodes, eq(episodes.id, weeklyEvents.episode))
      .innerJoin(seasons, eq(seasons.id, episodes.season))
      .innerJoin(leagues, eq(leagues.season, seasons.id))
      .where(and(
        eq(leagues.id, leagueId),
        eq(weeklyEventRules.type, 'vote'),
        eq(weeklyEventRules.referenceType, 'tribe'),
        lt(episodes.number, currentEpisode?.episode ?? -1)))
      .groupBy(tribes.name, episodes.number, weeklyEventRules.id),
    db
      .select({
        count: count(),
        member: leagueMembers.displayName,
        episode: episodes.number,
        points: weeklyEventRules.points,
        name: weeklyEventRules.name,
        description: weeklyEventRules.description,
        referenceType: weeklyEventRules.referenceType,
        timing: weeklyEventRules.timing,
        id: weeklyEventRules.id,
      })
      .from(weeklyMembers)
      .innerJoin(weeklyEvents, eq(weeklyEvents.id, weeklyMembers.event))
      .innerJoin(weeklyEventRules, eq(weeklyEventRules.id, weeklyEvents.rule))
      .innerJoin(leagueMembers, eq(leagueMembers.id, weeklyMembers.reference))
      .innerJoin(episodes, eq(episodes.id, weeklyEvents.episode))
      .innerJoin(seasons, eq(seasons.id, episodes.season))
      .innerJoin(leagues, eq(leagues.season, seasons.id))
      .where(and(
        eq(leagues.id, leagueId),
        eq(weeklyEventRules.type, 'vote'),
        eq(weeklyEventRules.referenceType, 'member'),
        lt(episodes.number, currentEpisode?.episode ?? -1)))
      .groupBy(leagueMembers.displayName, episodes.number, weeklyEventRules.id),
  ]);

  const skipVote = (episode: { episode: number, timing?: 'fullSeason' | 'preMerge' | 'postMerge' }) => {
    if (episode.timing === 'fullSeason') return false;
    if (!mergeEpisode || episode.episode < mergeEpisode.episode) return episode.timing === 'postMerge';
    if (episode.episode >= mergeEpisode.episode) return episode.timing === 'preMerge';
  };

  // tally the votes for each event for each episode
  const castawayVotes = events[3].reduce((lookup, vote) => {
    if (skipVote(vote)) return lookup;

    lookup[vote.episode] ??= {};
    lookup[vote.episode]![vote.id] ??= {};
    lookup[vote.episode]![vote.id]![vote.castaway] ??= { ...vote, count: 0 };
    lookup[vote.episode]![vote.id]![vote.castaway]!.count += vote.count;
    return lookup;
  }, {} as Record<number, Record<number, Record<string, Event & {
    count: number,
    castaway: string,
    id: number,
  }>>>);
  // get the max votes for each event for each episode
  const maxCastawayVotes = Object.values(castawayVotes).reduce((lookup, votes) => {
    Object.entries(votes).forEach(([eventId, eventVotes]) => {
      const eventIdNum = Number.parseInt(eventId);
      lookup[eventIdNum] ??= [];
      const maxVoteCount = Math.max(...[...lookup[eventIdNum], ...Object.values(eventVotes)]
        .map((vote) => vote.count));
      const maxVoted = Object.entries(eventVotes).filter(([_, vote]) => vote.count === maxVoteCount);
      lookup[eventIdNum].push(...maxVoted.map(([castaway, vote]) => ({ ...vote, castaway })));
    });
    return lookup;
  }, {} as Record<number, (Event & {
    count: number,
    castaway: string,
    id: number,
  })[]>);

  // do the same for tribe and member votes
  const tribeVotes = events[4].reduce((lookup, vote) => {
    if (skipVote(vote)) return lookup;

    lookup[vote.episode] ??= {};
    lookup[vote.episode]![vote.id] ??= {};
    lookup[vote.episode]![vote.id]![vote.tribe] ??= { ...vote, count: 0 };
    lookup[vote.episode]![vote.id]![vote.tribe]!.count += vote.count;
    return lookup;
  }, {} as Record<number, Record<number, Record<string, Event & {
    count: number,
    tribe: string,
    id: number,
  }>>>);
  const maxTribeVotes = Object.values(tribeVotes).reduce((lookup, votes) => {
    Object.entries(votes).forEach(([eventId, eventVotes]) => {
      const eventIdNum = Number.parseInt(eventId);
      lookup[eventIdNum] ??= [];
      const maxVoteCount = Math.max(...[...lookup[eventIdNum], ...Object.values(eventVotes)]
        .map((vote) => vote.count));
      const maxVoted = Object.entries(eventVotes).filter(([_, vote]) => vote.count === maxVoteCount);
      lookup[eventIdNum].push(...maxVoted.map(([tribe, vote]) => ({ ...vote, tribe })));
    });
    return lookup;
  }, {} as Record<number, (Event & {
    count: number,
    tribe: string,
    id: number,
  })[]>);
  const memberVotes = events[5].reduce((lookup, vote) => {
    if (skipVote(vote)) return lookup;

    lookup[vote.episode] ??= {};
    lookup[vote.episode]![vote.id] ??= {};
    lookup[vote.episode]![vote.id]![vote.member] ??= { ...vote, count: 0 };
    lookup[vote.episode]![vote.id]![vote.member]!.count += vote.count;
    return lookup;
  }, {} as Record<number, Record<number, Record<string, Event & {
    count: number,
    member: string,
    id: number,
  }>>>);
  const maxMemberVotes = Object.values(memberVotes).reduce((lookup, votes) => {
    Object.entries(votes).forEach(([eventId, eventVotes]) => {
      const eventIdNum = Number.parseInt(eventId);
      lookup[eventIdNum] ??= [];
      const maxVoteCount = Math.max(...[...lookup[eventIdNum], ...Object.values(eventVotes)]
        .map((vote) => vote.count));
      const maxVoted = Object.entries(eventVotes).filter(([_, vote]) => vote.count === maxVoteCount);
      lookup[eventIdNum].push(...maxVoted.map(([member, vote]) => ({ ...vote, member })));
    });
    return lookup;
  }, {} as Record<number, (Event & {
    count: number,
    member: string,
    id: number,
  })[]>);

  //console.log(maxCastawayVotes, maxTribeVotes, maxMemberVotes);

  return {
    castawayEvents: Object.values(maxCastawayVotes).flat(),
    tribeEvents: Object.values(maxTribeVotes).flat(),
    memberEvents: [...events[0], ...events[1], ...events[2], ...Object.values(maxMemberVotes).flat()],
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

  return eps.filter((ep) => new Date(`${ep.airDate} -4:00`) < new Date());
}

export async function getCurrentNextEpisodes(leagueId: number) {
  const { currentEpisode, nextEpisode, mergeEpisode } = await db
    .select({
      id: episodes.id,
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
    .orderBy(desc(episodes.number))
    .then((res) => {

      return {
        currentEpisode: res.find((ep) => new Date(`${ep.airDate} -4:00`).getTime() < new Date().getTime()),
        nextEpisode: res.reverse().find((ep) => new Date(`${ep.airDate} -4:00`).getTime() > new Date().getTime()),
        mergeEpisode: res.find((ep) => ep.merge),
      };
    });

  return { currentEpisode, nextEpisode, mergeEpisode };
}

type MemberEpisodeEvents = {
  weekly: {
    votes: WeeklyEventRuleType[];
    predictions: WeeklyEventRuleType[];
  };
  season: SeasonEventRuleType[];
  count: number;
};

export async function getMemberEpisodeEvents(leagueId: number): Promise<MemberEpisodeEvents> {
  const { memberId } = await eventAuth(leagueId);
  if (!memberId) throw new Error('Not authorized');

  const { currentEpisode, nextEpisode, mergeEpisode } = await getCurrentNextEpisodes(leagueId);

  if (!currentEpisode) return {
    weekly: { votes: [], predictions: [] },
    season: [],
    count: 0
  };
  const currentEpisodeDate = new Date(`${currentEpisode.airDate} -4:00`);
  const currentEpisodeEnd = new Date(currentEpisodeDate.getTime() + currentEpisode.runtime * 60 * 1000);
  if (currentEpisodeEnd > new Date()) {
    if (currentEpisode.merge) {
      const mergePredictions = await db
        .select({
          id: seasonEventRules.id,
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
          eq(seasonEventRules.timing, 'merge'),
          isNull(seasonEvents.id)));
      return {
        weekly: { votes: [], predictions: [] },
        season: mergePredictions,
        count: mergePredictions.length
      };
    }
    return {
      weekly: { votes: [], predictions: [] },
      season: [],
      count: 0
    };
  }

  // get votes for the current episode that this member has not yet scored
  const votes = await db
    .select({
      id: weeklyEventRules.id,
      name: weeklyEventRules.name,
      description: weeklyEventRules.description,
      points: weeklyEventRules.points,
      referenceType: weeklyEventRules.referenceType,
      type: weeklyEventRules.type,
      timing: weeklyEventRules.timing,
      weeklyEventId: weeklyEvents.id,
    })
    .from(weeklyEventRules)
    .leftJoin(weeklyEvents, and(
      eq(weeklyEvents.rule, weeklyEventRules.id),
      eq(weeklyEvents.member, memberId),
      eq(weeklyEvents.episode, currentEpisode.id)))
    .where(and(
      eq(weeklyEventRules.league, leagueId),
      eq(weeklyEventRules.type, 'vote'),
      isNull(weeklyEvents.id)))
    .then((res) => filterWeeklyEventsTiming(res, currentEpisode, mergeEpisode));
  // only if the next episode is available
  // and the current episode is done airing
  if (!nextEpisode || currentEpisodeEnd > new Date()) return {
    weekly: { votes, predictions: [] },
    season: [],
    count: votes.length
  };

  // get predictions for the next episode
  const predictions = await db
    .select({
      id: weeklyEventRules.id,
      name: weeklyEventRules.name,
      description: weeklyEventRules.description,
      points: weeklyEventRules.points,
      referenceType: weeklyEventRules.referenceType,
      type: weeklyEventRules.type,
      timing: weeklyEventRules.timing,
      weeklyEventId: weeklyEvents.id,
      episode: weeklyEvents.episode,
    })
    .from(weeklyEventRules)
    .leftJoin(weeklyEvents, and(
      eq(weeklyEvents.rule, weeklyEventRules.id),
      eq(weeklyEvents.member, memberId),
      eq(weeklyEvents.episode, nextEpisode.id)))
    .where(and(
      eq(weeklyEventRules.league, leagueId),
      eq(weeklyEventRules.type, 'predict'),
      isNull(weeklyEvents.id)))
    .then((res) => filterWeeklyEventsTiming(res, currentEpisode, mergeEpisode));
  // if the next episode is a merge or finale
  // get relevant season predictions
  if (nextEpisode.merge || nextEpisode.finale) {
    const seasonPredictions = await db
      .select({
        id: seasonEventRules.id,
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
      .then((res) => res.filter((rule) =>
        rule.timing === (nextEpisode.merge ? 'merge' : 'finale')));

    return {
      weekly: { votes, predictions },
      season: seasonPredictions,
      count: seasonPredictions.length + votes.length + predictions.length
    };
  } else {
    return {
      weekly: { votes, predictions },
      season: [],
      count: votes.length + predictions.length
    };
  }
}

function filterWeeklyEventsTiming<T>(
  ruleEvents: T & { timing: 'fullSeason' | 'preMerge' | 'postMerge' }[],
  currentEpisode: { episode: number },
  mergeEpisode?: { episode: number },
) {
  let filtered;
  if (!mergeEpisode || mergeEpisode.episode > currentEpisode.episode)
    filtered = ruleEvents.filter((rule) => rule.timing !== 'postMerge');
  filtered = ruleEvents.filter((rule) => rule.timing !== 'preMerge');

  return filtered as T & { timing: 'fullSeason' | 'preMerge' | 'postMerge' }[];
}
