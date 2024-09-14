'use server';

import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { leagueMembers } from '~/server/db/schema/members';
import { seasonCastaways, seasonEvents, seasonMembers, seasonTribes } from '~/server/db/schema/seasonEvents';

export interface Picks {
  firstPick: number;
  secondPick?: number;
  castaway: Record<number, number>;
  tribe: Record<number, number>;
  member: Record<number, number>;
}

export async function submitDraft(leagueId: number, picks: Picks) {
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  const memberId = await db
    .select({ id: leagueMembers.id })
    .from(leagueMembers)
    .where(and(
      eq(leagueMembers.league, leagueId),
      eq(leagueMembers.userId, user.userId)))
    .then((res) => res[0]?.id);
  if (!memberId) throw new Error('Member not found');

  await Promise.all([
    Promise.all(Object.entries(picks.castaway).map(async ([ruleId, castawayId]) => {
      // create event
      const eventId = await db
        .insert(seasonEvents)
        .values({ rule: Number.parseInt(ruleId), timing: 'premiere', member: memberId })
        .onConflictDoUpdate({
          target: [seasonEvents.rule, seasonEvents.member],
          set: { timing: 'premiere' },
        })
        .returning({ id: seasonEvents.id })
        .then((res) => res[0]?.id);
      if (!eventId) return;

      // submit pick
      return db.insert(seasonCastaways)
        .values({ event: eventId, castaway: castawayId })
        .onConflictDoUpdate({
          target: seasonCastaways.event,
          set: { castaway: castawayId },
        });
    })),
    Promise.all(Object.entries(picks.tribe).map(async ([ruleId, tribeId]) => {
      // create event
      const eventId = await db
        .insert(seasonEvents)
        .values({ rule: Number.parseInt(ruleId), timing: 'premiere', member: memberId })
        .onConflictDoUpdate({
          target: [seasonEvents.rule, seasonEvents.member],
          set: { timing: 'premiere' },
        })
        .returning({ id: seasonEvents.id })
        .then((res) => res[0]?.id);
      if (!eventId) return;

      // submit pick
      return db.insert(seasonTribes)
        .values({ event: eventId, tribe: tribeId })
        .onConflictDoUpdate({
          target: seasonCastaways.event,
          set: { tribe: tribeId },
        });
    })),
    Promise.all(Object.entries(picks.member).map(async ([ruleId, memberId]) => {
      // create event
      const eventId = await db
        .insert(seasonEvents)
        .values({ rule: Number.parseInt(ruleId), timing: 'premiere', member: memberId })
        .onConflictDoUpdate({
          target: [seasonEvents.rule, seasonEvents.member],
          set: { timing: 'premiere' },
        })
        .returning({ id: seasonEvents.id })
        .then((res) => res[0]?.id);
      if (!eventId) return;

      // submit pick
      return db.insert(seasonMembers)
        .values({ event: eventId, member: memberId })
        .onConflictDoUpdate({
          target: seasonCastaways.event,
          set: { member: memberId },
        });
    }))
  ]);
}
