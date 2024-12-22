import 'server-only';
import { aliasedTable, and, desc, eq, inArray, lt, or } from 'drizzle-orm';
import { db } from '~/server/db';
import { getCastawayEvents, getTribeEvents, getTribeUpdates } from '~/app/api/seasons/[name]/events/query';
import { leagues, type Reference } from '~/server/db/schema/leagues';
import { seasons } from '~/server/db/schema/seasons';
import { episodes } from '~/server/db/schema/episodes';
import { leagueMembers, selectionUpdates } from '~/server/db/schema/members';
import { castaways } from '~/server/db/schema/castaways';
import { customCastaways, customEventRules, customEvents, customMembers, customTribes } from '~/server/db/schema/customEvents';
import { tribes } from '~/server/db/schema/tribes';
import { weeklyCastawayResults, weeklyCastaways, weeklyEventRules, type WeeklyEventRuleType, weeklyEvents, type WeeklyEventTiming, weeklyMemberResults, weeklyMembers, weeklyTribeResults, weeklyTribes } from '~/server/db/schema/weeklyEvents';
import { seasonCastawayResults, seasonCastaways, seasonEventRules, type SeasonEventRuleType, seasonEvents, type SeasonEventTiming, seasonMemberResults, seasonMembers, seasonTribeResults, seasonTribes } from '~/server/db/schema/seasonEvents';
import { auth } from '@clerk/nextjs/server';

export async function leagueMemberAuth(leagueId: number): Promise<{ userId?: string, memberId?: number }> {
  const { userId } = await auth();
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
  const { memberId } = await leagueMemberAuth(leagueId);
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
  eventName: string;
  description: string;
  referenceType: Reference;
  timing?: WeeklyEventTiming | SeasonEventTiming;
};

export type EventResult = { name: string, displayName?: string } & Event


export interface AltEvents {
  castawayEvents: EventResult[];
  tribeEvents: EventResult[];
  memberEvents: EventResult[];
}

export async function getCustomEvents(leagueId: number): Promise<AltEvents> {
  const { memberId } = await leagueMemberAuth(leagueId);
  if (!memberId) throw new Error('Not authorized');

  const events = await Promise.all([
    db
      .select({
        name: castaways.shortName,
        episode: episodes.number,
        points: customEventRules.points,
        eventName: customEventRules.name,
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
      .where(eq(leagues.id, leagueId))
      .orderBy(desc(episodes.number)),
    db
      .select({
        name: tribes.name,
        displayName: tribes.name,
        episode: episodes.number,
        points: customEventRules.points,
        eventName: customEventRules.name,
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
      .where(eq(leagues.id, leagueId))
      .orderBy(desc(episodes.number)),
    db
      .select({
        name: leagueMembers.displayName,
        episode: episodes.number,
        points: customEventRules.points,
        eventName: customEventRules.name,
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
      .where(eq(leagues.id, leagueId))
      .orderBy(desc(episodes.number)),
  ]);

  return { castawayEvents: events[0], tribeEvents: events[1], memberEvents: events[2] };
}

export type PredictionResult = (
  EventResult & {
    result: string,
  }
);

export type Vote = (
  EventResult & {
    voter: string,
  }
);

export type VoteResult = (
  EventResult & {
    voters: string[],
  }
);

type WeeklyEventsRaw = {
  castawayVotes: Vote[]
  tribeVotes: Vote[]
  memberVotes: Vote[]
  predictions: PredictionResult[]
  currentEpisode?: { number: number, merge?: boolean, finale?: boolean, season: string };
  mergeEpisode?: { number: number, merge?: boolean, finale?: boolean, season: string };
};

const voter = aliasedTable(leagueMembers, 'voter');

export async function getWeeklyEventsRaw(leagueId: number): Promise<WeeklyEventsRaw> {
  const { memberId } = await leagueMemberAuth(leagueId);
  if (!memberId) throw new Error('Not authorized');

  const { currentEpisode, mergeEpisode } = await getKeyEpisodes(leagueId);

  if (!currentEpisode) return {
    castawayVotes: [],
    tribeVotes: [],
    memberVotes: [],
    predictions: [],
  };

  // weekly events are split in two, 
  // * predictions always earn points for the member directly
  // * votes are mapped to the castaway or tribe and them to members in scoring
  const events = await Promise.all([
    // predictions
    db.select({
      name: leagueMembers.displayName,
      episode: episodes.number,
      points: weeklyEventRules.points,
      eventName: weeklyEventRules.eventName,
      description: weeklyEventRules.description,
      referenceType: weeklyEventRules.referenceType,
      timing: weeklyEventRules.timing,
      result: castaways.name,
    })
      .from(weeklyCastawayResults)
      .innerJoin(weeklyEventRules, eq(weeklyEventRules.id, weeklyCastawayResults.rule))
      .innerJoin(leagues, eq(leagues.id, weeklyEventRules.league))
      .innerJoin(weeklyEvents, eq(weeklyEvents.rule, weeklyEventRules.id))
      .innerJoin(weeklyCastaways, eq(weeklyCastaways.event, weeklyEvents.id))
      .innerJoin(leagueMembers, eq(leagueMembers.id, weeklyEvents.member))
      .innerJoin(episodes, and(
        eq(episodes.id, weeklyCastawayResults.episode),
        eq(episodes.id, weeklyEvents.episode)))
      .innerJoin(castaways, eq(castaways.id, weeklyCastawayResults.result))
      .where(and(
        eq(leagues.id, leagueId),
        eq(weeklyEventRules.type, 'predict'),
        eq(weeklyEventRules.referenceType, 'castaway'),
        eq(weeklyCastawayResults.result, weeklyCastaways.reference)))
      .orderBy(desc(episodes.number))
      .then((res) => filterWeeklyEventsTiming(res, currentEpisode, mergeEpisode)),
    db.select({
      name: leagueMembers.displayName,
      episode: episodes.number,
      points: weeklyEventRules.points,
      eventName: weeklyEventRules.eventName,
      description: weeklyEventRules.description,
      referenceType: weeklyEventRules.referenceType,
      timing: weeklyEventRules.timing,
      result: tribes.name,
    })
      .from(weeklyTribeResults)
      .innerJoin(weeklyEventRules, eq(weeklyEventRules.id, weeklyTribeResults.rule))
      .innerJoin(leagues, eq(leagues.id, weeklyEventRules.league))
      .innerJoin(weeklyEvents, eq(weeklyEvents.rule, weeklyEventRules.id))
      .innerJoin(weeklyTribes, eq(weeklyTribes.event, weeklyEvents.id))
      .innerJoin(leagueMembers, eq(leagueMembers.id, weeklyEvents.member))
      .innerJoin(episodes, and(
        eq(episodes.id, weeklyTribeResults.episode),
        eq(episodes.id, weeklyEvents.episode)))
      .innerJoin(tribes, eq(tribes.id, weeklyTribeResults.result))
      .where(and(
        eq(leagues.id, leagueId),
        eq(weeklyEventRules.type, 'predict'),
        eq(weeklyEventRules.referenceType, 'tribe'),
        eq(weeklyTribeResults.episode, weeklyEvents.episode),
        eq(weeklyTribeResults.result, weeklyTribes.reference)))
      .orderBy(desc(episodes.number))
      .then((res) => filterWeeklyEventsTiming(res, currentEpisode, mergeEpisode)),
    db.select({
      name: leagueMembers.displayName,
      episode: episodes.number,
      points: weeklyEventRules.points,
      eventName: weeklyEventRules.eventName,
      description: weeklyEventRules.description,
      referenceType: weeklyEventRules.referenceType,
      timing: weeklyEventRules.timing,
      result: leagueMembers.displayName,
    })
      .from(weeklyMemberResults)
      .innerJoin(weeklyEventRules, eq(weeklyEventRules.id, weeklyMemberResults.rule))
      .innerJoin(leagues, eq(leagues.id, weeklyEventRules.league))
      .innerJoin(weeklyEvents, eq(weeklyEvents.rule, weeklyEventRules.id))
      .innerJoin(weeklyMembers, eq(weeklyMembers.event, weeklyEvents.id))
      .innerJoin(leagueMembers, eq(leagueMembers.id, weeklyEvents.member))
      .innerJoin(episodes, and(
        eq(episodes.id, weeklyMemberResults.episode),
        eq(episodes.id, weeklyEvents.episode)))
      .innerJoin(tribes, eq(tribes.id, weeklyMemberResults.result))
      .where(and(
        eq(leagues.id, leagueId),
        eq(weeklyEventRules.type, 'predict'),
        eq(weeklyEventRules.referenceType, 'member'),
        eq(weeklyMemberResults.episode, weeklyEvents.episode),
        eq(weeklyMemberResults.result, weeklyMembers.reference)))
      .orderBy(desc(episodes.number))
      .then((res) => filterWeeklyEventsTiming(res, currentEpisode, mergeEpisode)),
    // votes
    db.select({
      name: castaways.shortName,
      displayName: castaways.name,
      voter: voter.displayName,
      episode: episodes.number,
      points: weeklyEventRules.points,
      eventName: weeklyEventRules.eventName,
      description: weeklyEventRules.description,
      referenceType: weeklyEventRules.referenceType,
      timing: weeklyEventRules.timing,
      id: weeklyEventRules.id,
    })
      .from(weeklyCastaways)
      .innerJoin(weeklyEvents, eq(weeklyEvents.id, weeklyCastaways.event))
      .innerJoin(voter, eq(voter.id, weeklyEvents.member))
      .innerJoin(weeklyEventRules, eq(weeklyEventRules.id, weeklyEvents.rule))
      .innerJoin(leagues, eq(leagues.id, weeklyEventRules.league))
      .innerJoin(castaways, eq(castaways.id, weeklyCastaways.reference))
      .innerJoin(episodes, eq(episodes.id, weeklyEvents.episode))
      .where(and(
        eq(leagues.id, leagueId),
        eq(weeklyEventRules.type, 'vote'),
        eq(weeklyEventRules.referenceType, 'castaway'),
        lt(episodes.number, currentEpisode?.number ?? -1)))
      .groupBy(castaways.shortName, castaways.name, voter.displayName, episodes.number, weeklyEventRules.id)
      .orderBy(desc(episodes.number)),
    db.select({
      name: tribes.name,
      voter: voter.displayName,
      episode: episodes.number,
      points: weeklyEventRules.points,
      eventName: weeklyEventRules.eventName,
      description: weeklyEventRules.description,
      referenceType: weeklyEventRules.referenceType,
      timing: weeklyEventRules.timing,
      id: weeklyEventRules.id,
    })
      .from(weeklyTribes)
      .innerJoin(weeklyEvents, eq(weeklyEvents.id, weeklyTribes.event))
      .innerJoin(voter, eq(voter.id, weeklyEvents.member))
      .innerJoin(weeklyEventRules, eq(weeklyEventRules.id, weeklyEvents.rule))
      .innerJoin(leagues, eq(leagues.id, weeklyEventRules.league))
      .innerJoin(tribes, eq(tribes.id, weeklyTribes.reference))
      .innerJoin(episodes, eq(episodes.id, weeklyEvents.episode))
      .where(and(
        eq(leagues.id, leagueId),
        eq(weeklyEventRules.type, 'vote'),
        eq(weeklyEventRules.referenceType, 'tribe'),
        lt(episodes.number, currentEpisode?.number ?? -1)))
      .groupBy(tribes.name, voter.displayName, episodes.number, weeklyEventRules.id)
      .orderBy(desc(episodes.number)),
    db.select({
      name: leagueMembers.displayName,
      voter: voter.displayName,
      episode: episodes.number,
      points: weeklyEventRules.points,
      eventName: weeklyEventRules.eventName,
      description: weeklyEventRules.description,
      referenceType: weeklyEventRules.referenceType,
      timing: weeklyEventRules.timing,
      id: weeklyEventRules.id,
    })
      .from(weeklyMembers)
      .innerJoin(weeklyEvents, eq(weeklyEvents.id, weeklyMembers.event))
      .innerJoin(voter, eq(voter.id, weeklyEvents.member))
      .innerJoin(weeklyEventRules, eq(weeklyEventRules.id, weeklyEvents.rule))
      .innerJoin(leagues, eq(leagues.id, weeklyEventRules.league))
      .innerJoin(leagueMembers, eq(leagueMembers.id, weeklyMembers.reference))
      .innerJoin(episodes, eq(episodes.id, weeklyEvents.episode))
      .where(and(
        eq(leagues.id, leagueId),
        eq(weeklyEventRules.type, 'vote'),
        eq(weeklyEventRules.referenceType, 'member'),
        lt(episodes.number, currentEpisode?.number ?? -1)))
      .groupBy(leagueMembers.displayName, voter.displayName, episodes.number, weeklyEventRules.id)
      .orderBy(desc(episodes.number)),
  ]);

  return {
    castawayVotes: events[3],
    tribeVotes: events[4],
    memberVotes: events[5],
    predictions: [...events[0], ...events[1], ...events[2]],
    currentEpisode,
    mergeEpisode,
  };
}

// @JeffProbst
export function tallyTheVotes(votes: Vote[]) {
  const tallied = votes.reduce((collection, vote) => {
    collection[vote.episode] ??= {};
    collection[vote.episode]![vote.eventName] ??= [{ ...vote, voters: [] }];
    const voteIndex = collection[vote.episode]![vote.eventName]!.findIndex((v) => v.name === vote.name);
    if (voteIndex === -1) { // if there is no vote for this name, add it
      collection[vote.episode]![vote.eventName]!.push(
        { ...vote, name: vote.name, points: vote.points, voters: [vote.voter] });
    } else { // if there is a vote for this name, add the voter
      collection[vote.episode]![vote.eventName]![voteIndex]!.voters.push(vote.voter);
    }

    // ensure sorted order of votes by vote count so that the most voted for is first
    collection[vote.episode]![vote.eventName]!.sort((a, b) => b.voters.length - a.voters.length);

    return collection;
    //           episode      event name    
  }, {} as Record<number, Record<string, [VoteResult]>>);

  return tallied;
}


export async function getWeeklyEvents(leagueId: number): Promise<AltEvents> {
  const events = await getWeeklyEventsRaw(leagueId);

  // protection against votes that were cast incorrectly
  const filterVotes = (votes: Vote[]) => votes.filter((vote) => {
    if (vote.timing === 'fullSeason') return true;
    if (events.mergeEpisode && vote.episode >= events.mergeEpisode.number) return vote.timing === 'postMerge';
    return vote.timing === 'preMerge';
  });

  const getWinners = (talliedVotes: ReturnType<typeof tallyTheVotes>) => {
    return Object.values(talliedVotes).reduce((winners, votes) => {
      winners.push(...Object.values(votes).map((vote) => {
        const maxVoteCount = vote[0].voters.length;
        return vote.filter((v) => v.voters.length === maxVoteCount);
      }).flat());
      return winners;
    }, [] as VoteResult[]);
  };

  // tally the votes for each event for each episode
  const castawayVotes = getWinners(tallyTheVotes(filterVotes(events.castawayVotes)));
  const tribeVotes = getWinners(tallyTheVotes(filterVotes(events.tribeVotes)));
  const memberVotes = getWinners(tallyTheVotes(filterVotes(events.memberVotes)));


  return {
    castawayEvents: castawayVotes,
    tribeEvents: tribeVotes,
    memberEvents: [...events.predictions, ...memberVotes],
  };
}

export async function getSeasonEvents(leagueId: number): Promise<AltEvents> {
  const { memberId } = await leagueMemberAuth(leagueId);
  if (!memberId) throw new Error('Not authorized');

  // season events are all predictions and get mapped directly to members
  const events = await Promise.all([
    db.select({
      name: leagueMembers.displayName,
      episode: episodes.number,
      points: seasonEventRules.points,
      eventName: seasonEventRules.eventName,
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
        eq(seasonCastawayResults.result, seasonCastaways.reference)))
      .orderBy(desc(episodes.number)),
    db.select({
      name: leagueMembers.displayName,
      episode: episodes.number,
      points: seasonEventRules.points,
      eventName: seasonEventRules.eventName,
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
        eq(seasonTribeResults.result, seasonTribes.reference)))
      .orderBy(desc(episodes.number)),
    db.select({
      name: leagueMembers.displayName,
      episode: episodes.number,
      points: seasonEventRules.points,
      eventName: seasonEventRules.eventName,
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
        eq(seasonMemberResults.result, seasonMembers.reference)))
      .orderBy(desc(episodes.number)),
  ]);

  return { castawayEvents: [], tribeEvents: [], memberEvents: events.flat() };
}

export async function getCastawayMemberEpisodeTable(memberIds: number[]) {
  const { userId } = await auth();
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
    .where(inArray(leagueMembers.id, memberIds))
    .orderBy(desc(episodes.number));

  return updates.reduce((lookup, update) => {
    update.episode ??= 0;
    lookup[update.episode] ??= {};

    // initial castaway selection has null episode, replace with 0
    lookup[update.episode]![update.castaway] = update.member;

    return lookup;
  }, {} as Record<number, Record<string, string>>);
}

export async function getEpisodes(leagueId: number, includeFuture = false) {
  const eps = await db
    .select({
      id: episodes.id,
      title: episodes.title,
      number: episodes.number,
      airDate: episodes.airDate,
      runtime: episodes.runtime,
      merge: episodes.merge,
      finale: episodes.finale,
      season: seasons.name,
    })
    .from(episodes)
    .innerJoin(seasons, eq(seasons.id, episodes.season))
    .innerJoin(leagues, eq(leagues.season, seasons.id))
    .where(eq(leagues.id, leagueId))
    .orderBy(desc(episodes.number));

  if (includeFuture) return eps;

  return eps.filter((ep) => new Date(`${ep.airDate} -4:00`) < new Date());
}

export async function getKeyEpisodes(leagueId: number) {
  return await getEpisodes(leagueId, true)
    .then((res) => {
      return {
        currentEpisode: res.find((ep) => new Date(`${ep.airDate} -4:00`).getTime() < new Date().getTime()),
        nextEpisode: res.reverse().find((ep) => new Date(`${ep.airDate} -4:00`).getTime() > new Date().getTime()),
        premierEpisode: res.find((ep) => ep.number === 1),
        mergeEpisode: res.find((ep) => ep.merge),
        finaleEpisode: res.find((ep) => ep.finale),
      };
    });
}

export type WithPick = {
  pick: {
    castaway: string | null,
    tribe: string | null,
    member: string | null,
    color?: string | null
  }
};

export type WithResult = {
  result: {
    castaway: string | null,
    tribe: string | null,
    member: string | null,
    color?: string | null
  }
};

export type MemberEpisodeEvents = {
  weekly: {
    votes: (WeeklyEventRuleType & WithPick)[];
    predictions: (WeeklyEventRuleType & WithPick)[];
  };
  season: (SeasonEventRuleType & WithPick)[];
  count: number;
  picked: boolean;
  locked: boolean;
};

export async function getMemberEpisodeEvents(leagueId: number): Promise<MemberEpisodeEvents> {
  const { memberId } = await leagueMemberAuth(leagueId);
  if (!memberId) throw new Error('Not authorized');

  const { currentEpisode, nextEpisode, mergeEpisode } = await getKeyEpisodes(leagueId);

  if (!currentEpisode) return {
    weekly: { votes: [], predictions: [] },
    season: [],
    count: 0,
    picked: true,
    locked: false
  };
  const currentEpisodeDate = new Date(`${currentEpisode.airDate} -4:00`);
  const currentEpisodeEnd = new Date(currentEpisodeDate.getTime() + currentEpisode.runtime * 60 * 1000);

  // get votes for the current episode that this member has not yet scored
  const votes = await db
    .select({
      id: weeklyEventRules.id,
      eventName: weeklyEventRules.eventName,
      description: weeklyEventRules.description,
      points: weeklyEventRules.points,
      referenceType: weeklyEventRules.referenceType,
      type: weeklyEventRules.type,
      timing: weeklyEventRules.timing,
      weeklyEventId: weeklyEvents.id,
      pick: {
        castaway: castaways.name,
        tribe: tribes.name,
        member: leagueMembers.displayName,
      },
    })
    .from(weeklyEventRules)
    .leftJoin(weeklyEvents, and(
      eq(weeklyEvents.rule, weeklyEventRules.id),
      eq(weeklyEvents.member, memberId),
      eq(weeklyEvents.episode, currentEpisode.id)))
    .leftJoin(weeklyCastaways, eq(weeklyCastaways.event, weeklyEvents.id))
    .leftJoin(castaways, eq(castaways.id, weeklyCastaways.reference))
    .leftJoin(weeklyTribes, eq(weeklyTribes.event, weeklyEvents.id))
    .leftJoin(tribes, eq(tribes.id, weeklyTribes.reference))
    .leftJoin(weeklyMembers, eq(weeklyMembers.event, weeklyEvents.id))
    .leftJoin(leagueMembers, eq(leagueMembers.id, weeklyMembers.reference))
    .where(and(
      eq(weeklyEventRules.league, leagueId),
      eq(weeklyEventRules.type, 'vote')))
    .then((res) => filterWeeklyEventsTiming(res, currentEpisode, mergeEpisode));
  // only if the next episode is available
  // and the current episode is done airing
  if (!nextEpisode) {
    return {
      weekly: { votes, predictions: [] },
      season: [],
      count: votes.length,
      picked: votes.filter(pickMade).length === votes.length,
      locked: currentEpisodeEnd > new Date()
    };
  }

  const predictionEpisode = nextEpisode;

  // get predictions for the next episode
  const predictions = await db
    .select({
      id: weeklyEventRules.id,
      eventName: weeklyEventRules.eventName,
      description: weeklyEventRules.description,
      points: weeklyEventRules.points,
      referenceType: weeklyEventRules.referenceType,
      type: weeklyEventRules.type,
      timing: weeklyEventRules.timing,
      weeklyEventId: weeklyEvents.id,
      episode: weeklyEvents.episode,
      pick: {
        castaway: castaways.name,
        tribe: tribes.name,
        member: leagueMembers.displayName,
      },
    })
    .from(weeklyEventRules)
    .leftJoin(weeklyEvents, and(
      eq(weeklyEvents.rule, weeklyEventRules.id),
      eq(weeklyEvents.member, memberId),
      eq(weeklyEvents.episode, predictionEpisode.id)))
    .leftJoin(weeklyCastaways, eq(weeklyCastaways.event, weeklyEvents.id))
    .leftJoin(castaways, eq(castaways.id, weeklyCastaways.reference))
    .leftJoin(weeklyTribes, eq(weeklyTribes.event, weeklyEvents.id))
    .leftJoin(tribes, eq(tribes.id, weeklyTribes.reference))
    .leftJoin(weeklyMembers, eq(weeklyMembers.event, weeklyEvents.id))
    .leftJoin(leagueMembers, eq(leagueMembers.id, weeklyMembers.reference))
    .where(and(
      eq(weeklyEventRules.league, leagueId),
      eq(weeklyEventRules.type, 'predict')))
    .then((res) => filterWeeklyEventsTiming(res, currentEpisode, mergeEpisode));
  // if the next episode is a merge or finale
  // get relevant season predictions
  if (predictionEpisode.merge || predictionEpisode.finale) {
    const seasonPredictions = await db
      .select({
        id: seasonEventRules.id,
        eventName: seasonEventRules.eventName,
        description: seasonEventRules.description,
        points: seasonEventRules.points,
        referenceType: seasonEventRules.referenceType,
        timing: seasonEventRules.timing,
        pick: {
          castaway: castaways.name,
          tribe: tribes.name,
          member: leagueMembers.displayName,
        },
      })
      .from(seasonEventRules)
      .leftJoin(seasonEvents, and(
        eq(seasonEvents.rule, seasonEventRules.id),
        eq(seasonEvents.member, memberId)))
      .leftJoin(seasonCastaways, eq(seasonCastaways.event, seasonEvents.id))
      .leftJoin(castaways, eq(castaways.id, seasonCastaways.reference))
      .leftJoin(seasonTribes, eq(seasonTribes.event, seasonEvents.id))
      .leftJoin(tribes, eq(tribes.id, seasonTribes.reference))
      .leftJoin(seasonMembers, eq(seasonMembers.event, seasonEvents.id))
      .leftJoin(leagueMembers, eq(leagueMembers.id, seasonMembers.reference))
      .where(and(
        eq(seasonEventRules.league, leagueId),
        or(
          eq(seasonEventRules.timing, 'merge'),
          eq(seasonEventRules.timing, 'finale'))))
      .then((res) => res.filter((rule) =>
        rule.timing === (predictionEpisode.merge ? 'merge' : 'finale')));

    return {
      weekly: { votes, predictions },
      season: seasonPredictions,
      count: seasonPredictions.length + votes.length + predictions.length,
      picked: [...seasonPredictions, ...votes, ...predictions]
        .filter(pickMade).length ===
        seasonPredictions.length + votes.length + predictions.length,
      locked: currentEpisodeEnd > new Date()
    };
  } else {
    return {
      weekly: { votes, predictions },
      season: [],
      count: votes.length + predictions.length,
      picked: [...votes, ...predictions]
        .filter(pickMade).length === votes.length + predictions.length,
      locked: currentEpisodeEnd > new Date()
    };
  }
}

function filterWeeklyEventsTiming<T>(
  ruleEvents: T & { timing: 'fullSeason' | 'preMerge' | 'postMerge' }[],
  currentEpisode: { number: number },
  mergeEpisode?: { number: number },
) {
  let filtered;
  if (!mergeEpisode || mergeEpisode.number > currentEpisode.number)
    filtered = ruleEvents.filter((rule) => rule.timing !== 'postMerge');
  else filtered = ruleEvents.filter((rule) => rule.timing !== 'preMerge');

  return filtered as T & { timing: 'fullSeason' | 'preMerge' | 'postMerge' }[];
}

function pickMade<T extends WithPick>(pick: T & WithPick) {
  return pick.pick.castaway !== null || pick.pick.tribe !== null;
}
