'use server';
import { auth } from '@clerk/nextjs/server';
import { and, eq, inArray, or } from 'drizzle-orm';
import { db } from '~/server/db';
import { customCastaways, type CustomEventRuleType, customEvents, customMembers, customTribes } from '~/server/db/schema/customEvents';
import { seasonCastawayResults, seasonTribeResults, type SeasonEventRuleType } from '~/server/db/schema/seasonEvents';
import { weeklyCastawayResults, type WeeklyEventRuleType, weeklyMemberResults, weeklyTribeResults } from '~/server/db/schema/weeklyEvents';
import { leagues } from '~/server/db/schema/leagues';
import { leagueMembers } from '~/server/db/schema/members';

export async function leagueAuth(leagueId: number) {
  const { userId } = auth();
  if (!userId) return { userId };

  // ensure user is league admin or owner 
  // with the correct league, season for the episode, and rule
  await db
    .select()
    .from(leagueMembers)
    .innerJoin(leagues, eq(leagues.id, leagueMembers.league))
    .where(and(
      eq(leagueMembers.userId, userId),
      eq(leagueMembers.league, leagueId),
      or(eq(leagueMembers.isAdmin, true), eq(leagueMembers.isOwner, true))))
    .then((members) => {
      if (members.length === 0) return { userId: null };
      return members[0]!;
    });

  return { userId };
}

export async function submitCustomEvent(
  leagueId: number,
  episodeId: number,
  rule: CustomEventRuleType,
  references: { id: number; /*notes: string[]*/ }[],
  //commonNotes: string[]
) {
  const { userId } = await leagueAuth(leagueId);
  if (!userId) throw new Error('Not authorized');

  // first insert the event
  const event = await db
    .insert(customEvents)
    .values({ rule: rule.id, episode: episodeId })
    .returning({ id: customEvents.id })
    .then((res) => res[0]);
  if (!event) throw new Error('Failed to insert event');

  let insertTable: typeof customCastaways | typeof customTribes | typeof customMembers;
  switch (rule.referenceType) {
    case 'castaway':
      insertTable = customCastaways;
      break;
    case 'tribe':
      insertTable = customTribes;
      break;
    case 'member':
      insertTable = customMembers;
      break;
  }

  try {
    const confimration = await db
      .insert(insertTable)
      .values(references.map((ref) => ({ event: event.id, reference: ref.id })))
      .returning({ id: insertTable.id });
    if (confimration.length !== references.length) throw new Error('Failed to insert references');
  } catch {
    // rollback event the cascade should remove any successful inserts
    await db
      .delete(customEvents)
      .where(eq(customEvents.id, event.id));
    throw new Error('Failed to insert references');
  }

}

export async function submitWeeklyResult(
  leagueId: number,
  episodeId: number,
  rule: WeeklyEventRuleType,
  references: { id: number }[],
) {
  const { userId } = await leagueAuth(leagueId);
  if (!userId) throw new Error('Not authorized');

  let insertTable: typeof weeklyCastawayResults | typeof weeklyTribeResults | typeof weeklyMemberResults;
  switch (rule.referenceType) {
    case 'castaway':
      insertTable = weeklyCastawayResults;
      break;
    case 'tribe':
      insertTable = weeklyTribeResults;
      break;
    case 'member':
      insertTable = weeklyMemberResults;
      break;
  }

  const confirmation = await db
    .insert(insertTable)
    .values(references.map((ref) => ({ rule: rule.id, episode: episodeId, result: ref.id }))

    )
    .returning({ id: insertTable.id });
  try {
    if (confirmation.length !== references.length) throw new Error('Failed to insert references');
  } catch {
    // rollback any successful inserts
    await db
      .delete(insertTable)
      .where(inArray(insertTable.id, confirmation.map((c) => c.id)));
    throw new Error('Failed to insert references');
  }
}

export async function submitSeasonResult(
  leagueId: number,
  episodeId: number,
  rule: SeasonEventRuleType,
  references: { id: number }[],
) {
  const { userId } = await leagueAuth(leagueId);
  if (!userId) throw new Error('Not authorized');

  let insertTable: typeof seasonCastawayResults | typeof seasonTribeResults | typeof weeklyMemberResults;
  switch (rule.referenceType) {
    case 'castaway':
      insertTable = seasonCastawayResults;
      break;
    case 'tribe':
      insertTable = seasonTribeResults;
      break;
    case 'member':
      insertTable = weeklyMemberResults;
      break;
  }

  const confirmation = await db
    .insert(insertTable)
    .values(references.map((ref) => ({ rule: rule.id, episode: episodeId, result: ref.id }))
    )
    .returning({ id: insertTable.id });
  try {
    if (confirmation.length !== references.length) throw new Error('Failed to insert references');
  } catch {
    // rollback any successful inserts
    await db
      .delete(insertTable)
      .where(inArray(insertTable.id, confirmation.map((c) => c.id)));
    throw new Error('Failed to insert references');
  }
}
