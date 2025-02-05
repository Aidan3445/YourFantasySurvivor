'use server';
import { auth } from '@clerk/nextjs/server';
import { type DraftTiming } from '~/server/db/defs/leagues';
import { db } from '~/server/db';
import { baseEventRulesSchema } from '~/server/db/schema/baseEvents';
import { type BaseEventRuleType } from '~/server/db/defs/baseEvents';
import { leagueSettingsSchema, leaguesSchema } from '~/server/db/schema/leagues';
import { eq } from 'drizzle-orm';
import { leagueMemberAuth } from '~/lib/auth';
import { leagueMembersSchema } from '~/server/db/schema/leagueMembers';
import { type NewLeagueMember } from '~/server/db/defs/leagueMembers';

/**
  * Create a new league
  * @param league - the league to create
  * @param settings - the settings for the league
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
  rules: BaseEventRuleType
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

      // Insert the league settings and base event rules in parallel
      await trx
        .insert(leagueSettingsSchema)
        .values({ ...settings, leagueId })
        .returning({ leagueId: leagueSettingsSchema.leagueId });

      await trx
        .insert(baseEventRulesSchema)
        .values({ ...rules, leagueId })
        .returning({ leagueId: baseEventRulesSchema.leagueId });

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

  const leagueId = await db
    .select({ leagueId: leaguesSchema.leagueId })
    .from(leaguesSchema)
    .where(eq(leaguesSchema.leagueHash, leagueHash))
    .then((res) => res[0]?.leagueId);
  if (!leagueId) throw new Error('League not found');

  // Try to add the member, if there is a conflict, the user is already a member
  const insertedMember = await db
    .insert(leagueMembersSchema)
    .values({ leagueId, userId: user.userId, ...newMember })
    .returning({ memberId: leagueMembersSchema.memberId });

  if (!insertedMember[0]) throw new Error('Failed to add user as a member');

  return insertedMember[0].memberId;
}

/**
* Update the draft timing for a league
* @param leagueId - the id of the league
* @param draftTiming - the new draft timing
* @param draftDate - the new draft date
* @returns the updated league or undefined if not found
* @throws an error if the user is not authorized
* @throws an error if the draft timing cannot be updated
*/
export async function updateDraftTiming(leagueId: number, draftTiming: DraftTiming, draftDate: Date) {
  const { memberId } = await leagueMemberAuth(leagueId);
  if (!memberId) throw new Error('User not authorized');

  const league = await db
    .update(leagueSettingsSchema)
    .set({ draftTiming, draftDate: draftDate.toUTCString() })
    .where(eq(leagueSettingsSchema.leagueId, leagueId))
    .returning({ draftTiming: leagueSettingsSchema.draftTiming, draftDate: leagueSettingsSchema.draftDate });

  if (!league[0]) throw new Error('League not found');

  return league[0];
}
