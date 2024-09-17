'use server';

import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { leagueMembers, selectionUpdates } from '~/server/db/schema/members';
import { seasonCastaways, seasonEvents, seasonMembers, seasonTribes } from '~/server/db/schema/seasonEvents';

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
      .values({ member: memberId, episode: null, castaway: picks.firstPick })
      .onConflictDoNothing();
  }

  // predictions
  await Promise.all([
    Promise.all(Object.entries(picks.castaway).map(async ([ruleId, castaway]) => {
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
        .values({ event: eventId, castaway: castaway })
        .onConflictDoUpdate({
          target: seasonCastaways.event,
          set: { castaway },
        });
    })),
    Promise.all(Object.entries(picks.tribe).map(async ([ruleId, tribe]) => {
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
        .values({ event: eventId, tribe })
        .onConflictDoUpdate({
          target: seasonCastaways.event,
          set: { tribe },
        });
    })),
    Promise.all(Object.entries(picks.member).map(async ([ruleId, member]) => {
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
        .values({ event: eventId, member })
        .onConflictDoUpdate({
          target: seasonCastaways.event,
          set: { member },
        });
    }))
  ]);
}
