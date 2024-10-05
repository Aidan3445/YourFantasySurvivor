'use server';
import { auth } from '@clerk/nextjs/server';
import { and, asc, desc, eq, or, lt } from 'drizzle-orm';
import { db } from '~/server/db';
import { castaways } from '~/server/db/schema/castaways';
import { episodes } from '~/server/db/schema/episodes';
import { leagues } from '~/server/db/schema/leagues';
import { leagueMembers, selectionUpdates } from '~/server/db/schema/members';
import { seasonCastaways, seasonEvents, seasonMembers, seasonTribes } from '~/server/db/schema/seasonEvents';
import { seasons } from '~/server/db/schema/seasons';

export interface Picks {
  firstPick?: number;
  secondPick?: number;
  castaway: Record<number, number>;
  tribe: Record<number, number>;
  member: Record<number, number>;
}

export async function submitDraft(leagueId: number, picks: Picks) {
  const { userId } = auth();
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
  const { userId } = auth();
  if (!userId) throw new Error('User not authenticated');

  const memberId = await db
    .select({ id: leagueMembers.id })
    .from(leagueMembers)
    .where(and(
      eq(leagueMembers.league, leagueId),
      eq(leagueMembers.userId, userId)))
    .then((res) => res[0]?.id);
  if (!memberId) throw new Error('Member not found');

  const eps = await db
    .select({ id: episodes.id, airDate: episodes.airDate })
    .from(episodes)
    .innerJoin(seasons, eq(seasons.id, episodes.season))
    .innerJoin(leagues, eq(leagues.season, seasons.id))
    .where(eq(leagues.id, leagueId))
    .orderBy(asc(episodes.number));

  const currentEp = eps.find((ep) => Date.now() < new Date(`${ep.airDate} -5:00`).getTime())?.id;
  if (!currentEp) throw new Error('No future episodes');

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
        lt(selectionUpdates.episode, currentEp)))
      .orderBy(desc(selectionUpdates.episode))
      .then((res) => res[0]?.castaway),
  ]);
  if (!newCastawayId) throw new Error('Castaway not found');

  if (newCastawayId === currentCastawayId) {
    await db
      .delete(selectionUpdates)
      .where(and(
        eq(selectionUpdates.member, memberId),
        eq(selectionUpdates.episode, currentEp)));
    return;
  }


  await db
    .insert(selectionUpdates)
    .values({ member: memberId, episode: currentEp, castaway: newCastawayId })
    .onConflictDoUpdate({
      target: [selectionUpdates.member, selectionUpdates.episode],
      set: { castaway: newCastawayId },
    });
}


