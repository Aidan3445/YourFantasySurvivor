'use server';
import { auth } from '@clerk/nextjs/server';
import { type DraftTiming } from '~/server/db/defs/leagues';
import { db } from '~/server/db';
import { baseEventRulesSchema } from '~/server/db/schema/baseEvents';
import { type BaseEventRuleType } from '~/server/db/defs/baseEvents';
import { leagueSettingsSchema, leaguesSchema } from '~/server/db/schema/leagues';
import { and, eq } from 'drizzle-orm';
import { leagueMemberAuth } from '~/lib/auth';
import { leagueMembersSchema } from '~/server/db/schema/leagueMembers';
import { type NewLeagueMember } from '~/server/db/defs/leagueMembers';

/**
  * Create a new league
  * @param league - the league to create
  * @param settings - the settings for the league
  * @param rules - the base event rules for the league
  * @param newMember - the new member to add
  * @returns the id of the newly created league
  * @throws an error if the user is not authenticated
  * @throws an error if the league cannot be inserted
  * @throws an error if the league settings cannot be inserted
  * @throws an error if the base event rules cannot be inserted
  * @throws an error if the user cannot be added as a member
  */
export async function createNewLeague(
  leagueName: string,
  settings: { draftTiming: DraftTiming, survivalCap: number },
  rules: BaseEventRuleType,
  newMember: NewLeagueMember
): Promise<string> {
  const user = await auth();
  if (!user.userId) throw new Error('User not authenticated');

  // Get the season id
  // In future this will be a real fetch
  const seasonId = 11;

  // Create the league in a transaction
  return await db.transaction(async (trx) => {
    try {
      const insertedLeague = await trx
        .insert(leaguesSchema)
        .values({ leagueName, leagueSeason: seasonId })
        .returning({ leagueId: leaguesSchema.leagueId, leagueHash: leaguesSchema.leagueHash });

      // Safe to assume the league was inserted if we got this far
      // Get the league id and hash
      const { leagueId, leagueHash } = insertedLeague[0]!;

      // Insert the owner as a member
      const memberId = await trx
        .insert(leagueMembersSchema)
        .values({ leagueId, userId: user.userId, ...newMember })
        .returning({ memberId: leagueMembersSchema.memberId })
        .then((res) => res[0]?.memberId);
      if (!memberId) throw new Error('Failed to add user as a member');

      // Insert the league settings
      await trx
        .insert(leagueSettingsSchema)
        .values({ ...settings, leagueId, draftOrder: [memberId] });
      // Insert the base event rules
      await trx
        .insert(baseEventRulesSchema)
        .values({ ...rules, leagueId });

      return leagueHash;
    } catch (error) {
      console.error('Error creating league:', error);
      // Rollback the transaction
      trx.rollback();
      throw new Error('An error occurred while creating the league. Please try again.');
    }
  });
}

/** 
  * Join a league
  * @param leagueHash - the hash of the league
  * @param newMember - the new member to add
  * @param userId - the id of the user
  * @returns the id of the newly created member
  * @throws an error if the user is not authenticated
  * @throws an error if the league cannot be found
  * @throws an error if the user is already a member of the league
  * @throws an error if the user cannot be added as a member
  */
export async function joinLeague(leagueHash: string, newMember: NewLeagueMember): Promise<number> {
  const user = await auth();
  if (!user.userId) throw new Error('User not authenticated');

  const { leagueId, draftOrder } = await db
    .select({ leagueId: leaguesSchema.leagueId, draftOrder: leagueSettingsSchema.draftOrder })
    .from(leaguesSchema)
    .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId))
    .where(eq(leaguesSchema.leagueHash, leagueHash))
    .then((res) => ({ leagueId: res[0]?.leagueId, draftOrder: res[0]?.draftOrder }));
  if (!leagueId || !draftOrder) throw new Error('League not found');

  return await db.transaction(async (trx) => {
    // Try to add the member, if there is a conflict, the user is already a member
    const insertedMember = await db
      .insert(leagueMembersSchema)
      .values({ leagueId, userId: user.userId, ...newMember })
      .returning({ memberId: leagueMembersSchema.memberId })
      .then((res) => res[0]);
    if (!insertedMember) throw new Error('Failed to add user as a member');
    // Add the member to the draft order
    draftOrder.push(insertedMember.memberId);
    await trx
      .update(leagueSettingsSchema)
      .set({ draftOrder })
      .where(eq(leagueSettingsSchema.leagueId, leagueId));

    return insertedMember.memberId;
  });
}

/**
* Update the draft timing for a league
* @param leagueHash - the hash of the league
* @param draftTiming - the new draft timing
* @param draftDate - the new draft date
* @returns the updated league or undefined if not found
* @throws an error if the user is not authorized
* @throws an error if the draft timing cannot be updated
*/
export async function updateDraftTiming(leagueHash: string, draftTiming: DraftTiming, draftDate: Date) {
  const { memberId } = await leagueMemberAuth(leagueHash);
  if (!memberId) throw new Error('User not authorized');

  // Error can be ignored, the where clause is not understood by the type system
  const league = await db
    .update(leagueSettingsSchema)
    .set({ draftTiming, draftDate: draftDate.toUTCString() })
    .from(leaguesSchema)
    .where(and(
      eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId),
      eq(leaguesSchema.leagueHash, leagueHash)))
    .returning({ draftTiming: leagueSettingsSchema.draftTiming, draftDate: leagueSettingsSchema.draftDate });

  if (!league[0]) throw new Error('League not found');

  return league[0];
}
