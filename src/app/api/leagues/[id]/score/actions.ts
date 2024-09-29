'use server';
import { auth } from '@clerk/nextjs/server';
import { and, eq, or } from 'drizzle-orm';
import { db } from '~/server/db';
import { customCastaways, customEventRules, type CustomEventRuleType, customEvents, customMembers, customTribes } from '~/server/db/schema/customEvents';
import { episodes } from '~/server/db/schema/episodes';
import { leagues } from '~/server/db/schema/leagues';
import { leagueMembers } from '~/server/db/schema/members';
import { seasons } from '~/server/db/schema/seasons';

export async function submitCustomEvent(
  leagueId: number,
  episodeId: number,
  rule: CustomEventRuleType,
  references: { id: number; /*notes: string[]*/ }[],
  //commonNotes: string[]
) {
  const { userId } = auth();
  if (!userId) throw new Error('Not authenticated');

  // ensure user is league admin or owner 
  // with the correct league, season for the episode, and rule
  await db
    .select()
    .from(leagueMembers)
    .innerJoin(customEventRules, eq(customEventRules.league, leagueMembers.league))
    .innerJoin(leagues, eq(leagues.id, leagueMembers.league))
    .innerJoin(seasons, eq(seasons.id, leagues.season))
    .innerJoin(episodes, eq(episodes.season, seasons.id))
    .where(and(
      eq(leagueMembers.userId, userId),
      eq(leagueMembers.league, leagueId),
      eq(customEventRules.id, rule.id!),
      eq(episodes.id, episodeId),
      or(eq(leagueMembers.isAdmin, true), eq(leagueMembers.isOwner, true))))
    .then((members) => {
      if (members.length === 0) throw new Error('Not authorized');
      return members[0]!;
    });

  // first insert the event
  const event = await db
    .insert(customEvents)
    .values({ rule: rule.id!, episode: episodeId })
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
    // rollback event
    await db
      .delete(customEvents)
      .where(eq(customEvents.id, event.id));
    throw new Error('Failed to insert references');
  }

}
