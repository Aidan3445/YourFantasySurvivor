'use server';
import { auth } from '@clerk/nextjs/server';
import { and, desc, eq, or, lt, inArray } from 'drizzle-orm';
import { db } from '~/server/db';
import { castaways } from '~/server/db/schema/castaways';
import { episodes } from '~/server/db/schema/episodes';
import { leagues } from '~/server/db/schema/leagues';
import { leagueMembers, selectionUpdates } from '~/server/db/schema/members';
import { seasonCastaways, seasonEvents, seasonMembers, seasonTribes } from '~/server/db/schema/seasonEvents';
import { seasons } from '~/server/db/schema/seasons';
import { getCurrentNextEpisodes } from '../score/query';
import { weeklyCastaways, weeklyEvents, weeklyMembers, weeklyTribes } from '~/server/db/schema/weeklyEvents';
import { getRemainingCastaways } from '~/app/api/seasons/[name]/castaways/query';
import { getLeague } from '../../query';

export interface Picks {
  firstPick?: number;
  secondPick?: number;
  castaway: Record<number, number>;
  tribe: Record<number, number>;
  member: Record<number, number>;
}

export async function submitDraft(leagueId: number, picks: Picks) {
  const { userId } = await auth();
  if (!userId) throw new Error('User not authenticated');

  const firstEp = await db
    .select({ id: episodes.id })
    .from(episodes)
    .innerJoin(seasons, eq(seasons.id, episodes.season))
    .innerJoin(leagues, eq(leagues.season, seasons.id))
    .where(and(
      eq(leagues.id, leagueId),
      eq(episodes.number, 1)));
  if (!firstEp[0]) throw new Error('Season does not have any episodes');

  const memberId = await db
    .select({ id: leagueMembers.id })
    .from(leagueMembers)
    .where(and(
      eq(leagueMembers.league, leagueId),
      eq(leagueMembers.userId, userId)))
    .then((res) => res[0]?.id);
  if (!memberId) throw new Error('Member not found');

  // initial pick (cannot be changed via draft form)
  if (picks.firstPick) {
    await db.insert(selectionUpdates)
      .values({ member: memberId, episode: firstEp[0].id, castaway: picks.firstPick })
      .onConflictDoNothing();
  }

  // predictions
  await Promise.all([
    Promise.all(Object.entries(picks.castaway).map(async ([ruleId, castaway]) => {
      // create event
      const eventId = await db
        .insert(seasonEvents)
        .values({ rule: Number.parseInt(ruleId), member: memberId })
        .onConflictDoNothing({
          target: [seasonEvents.rule, seasonEvents.member],
        })
        .returning({ id: seasonEvents.id })
        .then((res) => res[0]?.id);
      if (!eventId) return;

      // submit pick
      return db.insert(seasonCastaways)
        .values({ event: eventId, reference: castaway })
        .onConflictDoUpdate({
          target: seasonCastaways.event,
          set: { reference: castaway },
        });
    })),
    Promise.all(Object.entries(picks.tribe).map(async ([ruleId, tribe]) => {
      // create event
      const eventId = await db
        .insert(seasonEvents)
        .values({ rule: Number.parseInt(ruleId), member: memberId })
        .onConflictDoNothing({
          target: [seasonEvents.rule, seasonEvents.member],
        })
        .returning({ id: seasonEvents.id })
        .then((res) => res[0]?.id);
      if (!eventId) return;

      // submit pick
      return db.insert(seasonTribes)
        .values({ event: eventId, reference: tribe })
        .onConflictDoUpdate({
          target: seasonCastaways.event,
          set: { reference: tribe },
        });
    })),
    Promise.all(Object.entries(picks.member).map(async ([ruleId, member]) => {
      // create event
      const eventId = await db
        .insert(seasonEvents)
        .values({ rule: Number.parseInt(ruleId), member: memberId })
        .onConflictDoNothing({
          target: [seasonEvents.rule, seasonEvents.member],
        })
        .returning({ id: seasonEvents.id })
        .then((res) => res[0]?.id);
      if (!eventId) return;

      // submit pick
      return db.insert(seasonMembers)
        .values({ event: eventId, reference: member })
        .onConflictDoUpdate({
          target: seasonCastaways.event,
          set: { reference: member },
        });
    }))
  ]);
}

export async function changeSurvivorPick(leagueId: number, castaway: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('User not authenticated');

  const { memberId, season } = await db
    .select({ memberId: leagueMembers.id, season: seasons.name })
    .from(leagueMembers)
    .innerJoin(leagues, eq(leagues.id, leagueMembers.league))
    .innerJoin(seasons, eq(seasons.id, leagues.season))
    .where(and(
      eq(leagueMembers.league, leagueId),
      eq(leagueMembers.userId, userId)))
    .then((res) => res[0] ?? { memberId: undefined, season: undefined });
  if (!memberId || !season) throw new Error('Member not found');

  // check if changes are allowed block changes if:
  // a) there are no remaining castaways that are not picked
  // b) there is a member who's current pick was eliminated
  const [league, remaining] = await Promise.all([
    getLeague(leagueId),
    getRemainingCastaways(season)
  ]);
  if (league.members.length >= remaining.length) throw new Error('No castaways remain.');
  if (league.members.filter((m) => m.id !== memberId)
    .some((m) => !remaining.some((r) => r.more.shortName === m.drafted.slice(-1)[0]))) {
    throw new Error('You cannot change your survivor pick until all league members have one.');
  }

  const { nextEpisode } = await getCurrentNextEpisodes(leagueId);
  if (!nextEpisode) throw new Error('No future episodes');

  const [newCastawayId, currentCastawayId] = await Promise.all([
    db
      .select({ id: castaways.id })
      .from(castaways)
      .innerJoin(seasons, eq(seasons.id, castaways.season))
      .innerJoin(leagues, eq(leagues.season, seasons.id))
      .where(and(
        eq(leagues.id, leagueId),
        or(eq(castaways.name, castaway), eq(castaways.shortName, castaway))))
      .then((res) => res[0]?.id),
    db
      .select({ castaway: castaways.id })
      .from(selectionUpdates)
      .innerJoin(leagueMembers, eq(leagueMembers.id, selectionUpdates.member))
      .innerJoin(castaways, eq(castaways.id, selectionUpdates.castaway))
      .where(and(
        eq(leagueMembers.id, memberId),
        lt(selectionUpdates.episode, nextEpisode.id)))
      .orderBy(desc(selectionUpdates.episode))
      .then((res) => res[0]?.castaway),
  ]);
  if (!newCastawayId) throw new Error('Castaway not found');

  if (newCastawayId === currentCastawayId) {
    await db
      .delete(selectionUpdates)
      .where(and(
        eq(selectionUpdates.member, memberId),
        eq(selectionUpdates.episode, nextEpisode.id)));
    return;
  }


  await db
    .insert(selectionUpdates)
    .values({ member: memberId, episode: nextEpisode.id, castaway: newCastawayId })
    .onConflictDoUpdate({
      target: [selectionUpdates.member, selectionUpdates.episode],
      set: { castaway: newCastawayId },
    });
}

export type VotePredicts = {
  weeklyVotes: {
    castaway: Record<number, number>;
    tribe: Record<number, number>;
    member: Record<number, number>;
  };
  weeklyPredicts: {
    castaway: Record<number, number>;
    tribe: Record<number, number>;
    member: Record<number, number>;
  };
  seasonPredicts: {
    castaway: Record<number, number>;
    tribe: Record<number, number>;
    member: Record<number, number>;
  };
};

export async function submitVotesPredicts(
  leagueId: number,
  data: VotePredicts,
) {
  const { userId } = await auth();
  if (!userId) throw new Error('User not authenticated');

  const memberId = await db
    .select({ id: leagueMembers.id })
    .from(leagueMembers)
    .where(and(
      eq(leagueMembers.league, leagueId),
      eq(leagueMembers.userId, userId)))
    .then((res) => res[0]?.id);
  if (!memberId) throw new Error('Member not found');

  const { currentEpisode, nextEpisode } = await getCurrentNextEpisodes(leagueId);
  if (!currentEpisode) throw new Error('No current episode');

  const weeklyVoteRules = [
    ...Object.keys(data.weeklyVotes.castaway),
    ...Object.keys(data.weeklyVotes.tribe),
    ...Object.keys(data.weeklyVotes.member)
  ];

  const weeklyVoteEvents = weeklyVoteRules.length ? await db
    .insert(weeklyEvents)
    .values(weeklyVoteRules.map((rule) => ({
      rule: Number.parseInt(rule),
      member: memberId,
      episode: currentEpisode.id,
    })))
    .onConflictDoUpdate({
      target: [weeklyEvents.rule, weeklyEvents.member, weeklyEvents.episode],
      set: { episode: currentEpisode.id },
    })
    .returning({ id: weeklyEvents.id, rule: weeklyEvents.rule })
    : [];

  const events: ({ id: number }[] | undefined)[]
    = await Promise.all([
      ...Object.entries(data.weeklyVotes.castaway).map(([ruleId, castaway]) => {
        const event = weeklyVoteEvents.find((e) => e.rule === Number.parseInt(ruleId));
        if (!event) return;
        return db
          .insert(weeklyCastaways)
          .values({ event: event.id, reference: castaway })
          .returning({ id: weeklyCastaways.id });
      }),
      ...Object.entries(data.weeklyVotes.tribe).map(([ruleId, tribe]) => {
        const event = weeklyVoteEvents.find((e) => e.rule === Number.parseInt(ruleId));
        if (!event) return;
        return db
          .insert(weeklyTribes)
          .values({ event: event.id, reference: tribe })
          .returning({ id: weeklyTribes.id });
      }),
      ...Object.entries(data.weeklyVotes.member).map(([ruleId, member]) => {
        const event = weeklyVoteEvents.find((e) => e.rule === Number.parseInt(ruleId));
        if (!event) return;
        return db
          .insert(weeklyMembers)
          .values({ event: event.id, reference: member })
          .returning({ id: weeklyMembers.id });
      }),
    ]);

  if (!nextEpisode) throw new Error('No next episode');

  const weeklyPredictRules = [
    ...Object.keys(data.weeklyPredicts.castaway),
    ...Object.keys(data.weeklyPredicts.tribe),
    ...Object.keys(data.weeklyPredicts.member),
  ];

  const seasonPredictRules = [
    ...Object.keys(data.seasonPredicts.castaway),
    ...Object.keys(data.seasonPredicts.tribe),
    ...Object.keys(data.seasonPredicts.member)
  ];

  const [weeklyPredictEvents, seasonPredictEvents] = await Promise.all([
    weeklyPredictRules.length ? db
      .insert(weeklyEvents)
      .values(weeklyPredictRules.map((rule) => ({
        rule: Number.parseInt(rule),
        member: memberId,
        episode: nextEpisode.id,
      })))
      .onConflictDoUpdate({
        target: [weeklyEvents.rule, weeklyEvents.member, weeklyEvents.episode],
        set: { episode: nextEpisode.id },
      })
      .returning({ id: weeklyEvents.id, rule: weeklyEvents.rule })
      : [],
    seasonPredictRules.length ? db
      .insert(seasonEvents)
      .values(seasonPredictRules.map((rule) => ({
        rule: Number.parseInt(rule),
        member: memberId,
      })))
      .onConflictDoUpdate({
        target: [seasonEvents.rule, seasonEvents.member], set: { member: memberId },
      })
      .returning({ id: seasonEvents.id, rule: seasonEvents.rule })
      : [],
  ]);

  events.push(...(await Promise.all([
    ...Object.entries(data.weeklyPredicts.castaway).map(([ruleId, castaway]) => {
      const event = weeklyPredictEvents.find((e) => e.rule === Number.parseInt(ruleId));
      if (!event) return;
      return db
        .insert(weeklyCastaways)
        .values({ event: event.id, reference: castaway })
        .returning({ id: weeklyCastaways.id });
    }),
    ...Object.entries(data.weeklyPredicts.tribe).map(([ruleId, tribe]) => {
      const event = weeklyPredictEvents.find((e) => e.rule === Number.parseInt(ruleId));
      if (!event) return;
      return db
        .insert(weeklyTribes)
        .values({ event: event.id, reference: tribe })
        .returning({ id: weeklyTribes.id });
    }),
    ...Object.entries(data.weeklyPredicts.member).map(([ruleId, member]) => {
      const event = weeklyPredictEvents.find((e) => e.rule === Number.parseInt(ruleId));
      if (!event) return;
      return db
        .insert(weeklyMembers)
        .values({ event: event.id, reference: member })
        .returning({ id: weeklyMembers.id });
    }),
    ...Object.entries(data.seasonPredicts.castaway).map(([ruleId, castaway]) => {
      const event = seasonPredictEvents.find((e) => e.rule === Number.parseInt(ruleId));
      if (!event) return;
      return db
        .insert(seasonCastaways)
        .values({ event: event.id, reference: castaway })
        .returning({ id: seasonCastaways.id });
    }),
    ...Object.entries(data.seasonPredicts.tribe).map(([ruleId, tribe]) => {
      const event = seasonPredictEvents.find((e) => e.rule === Number.parseInt(ruleId));
      if (!event) return;
      return db
        .insert(seasonTribes)
        .values({ event: event.id, reference: tribe })
        .returning({ id: seasonTribes.id });
    }),
    ...Object.entries(data.seasonPredicts.member).map(([ruleId, member]) => {
      const event = seasonPredictEvents.find((e) => e.rule === Number.parseInt(ruleId));
      if (!event) return;
      return db
        .insert(seasonMembers)
        .values({ event: event.id, reference: member })
        .returning({ id: seasonMembers.id });
    }),
  ])));

  if (events.filter((e) => e).length !==
    weeklyVoteRules.length + weeklyPredictRules.length + seasonPredictRules.length) {
    // rollback events
    await Promise.all([
      db
        .delete(weeklyEvents)
        .where(inArray(weeklyEvents.id, weeklyVoteEvents.map((e) => e.id))),
      db
        .delete(weeklyEvents)
        .where(inArray(weeklyEvents.id, weeklyPredictEvents.map((e) => e.id))),
      db
        .delete(seasonEvents)
        .where(inArray(seasonEvents.id, seasonPredictEvents.map((e) => e.id))),
    ]);

    throw new Error('Failed to insert all events');
  }
}
