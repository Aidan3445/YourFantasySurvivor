'use server';

import { db } from '~/server/db';
import { eq, sql } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { leagueSettingsSchema } from '~/server/db/schema/leagues';
import { seasonSchema } from '~/server/db/schema/seasons';
import { type NewLeagueMember } from '~/types/leagueMembers';

/**
 * Join a league
 * @param userId The user joining the league
 * @param hash The hash of the league
 * @param newMember The new member to add
 * @throws an error if the league cannot be found
 * @throws an error if the user is already a member of the league
 * @throws an error if the user cannot be added as a member
 * @throws an error if the league is not in the predraft status
 * @returns an object indicating success
 * @returnObj `{ success: true }`
 */
export default async function joinLeagueLogic(
  userId: string,
  hash: string,
  newMember: NewLeagueMember
) {
  // Transaction to join the league
  return await db.transaction(async (trx) => {
    const league = await trx
      .select({
        leagueId: leagueSchema.leagueId,
        name: leagueSchema.name,
        status: leagueSchema.status,
        season: seasonSchema.name,
      })
      .from(leagueSchema)
      .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leagueSchema.leagueId))
      .innerJoin(seasonSchema, eq(seasonSchema.seasonId, leagueSchema.season))
      .where(eq(leagueSchema.hash, hash))
      .then((leagues) => leagues[0]);

    if (!league) throw new Error('League not found');

    if (league.status !== 'Predraft') {
      throw new Error('Cannot join after the draft has started');
    }

    const draftOrder = await db
      .select({ draftOrder: sql`COALESCE(MAX(draft_order), 0) + 1` })
      .from(leagueMemberSchema)
      .where(eq(leagueMemberSchema.leagueId, league.leagueId))
      .then(res => res[0]?.draftOrder as number | null);

    if (!draftOrder) throw new Error('Failed to determine draft order');

    // Try to add the member, if there is a conflict, the user is already a member
    const memberId = await trx
      .insert(leagueMemberSchema)
      .values({ leagueId: league.leagueId, userId: userId, ...newMember, draftOrder })
      .returning({ memberId: leagueMemberSchema.memberId })
      .then((res) => res[0]?.memberId);
    if (!memberId) throw new Error('Failed to add user as a member');

    return { success: true };
  });
}
