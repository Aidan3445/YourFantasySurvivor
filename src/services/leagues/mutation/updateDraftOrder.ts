import 'server-only';

import { db } from '~/server/db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';

/**
 * Update the draft order for a league
 * @param auth The authenticated league member
 * @param draftOrder The new draft order
 * @throws an error if the draft order cannot be updated
 * @returns Success status of the update
 * @returnObj `{ success }`
 */
export default async function updateDraftOrderLogic(
  auth: VerifiedLeagueMemberAuth,
  draftOrder: number[]
) {
  if (auth.status === 'Inactive') throw new Error('League is inactive');
  // Transaction to update the draft order
  return await db.transaction(async (trx) => {
    // Verify all members exist first
    const validMembers = await trx
      .select({ memberId: leagueMemberSchema.memberId })
      .from(leagueMemberSchema)
      .where(and(
        eq(leagueMemberSchema.leagueId, auth.leagueId),
        inArray(leagueMemberSchema.memberId, draftOrder)
      ))
      .then(res => res.map(r => r.memberId));

    if (validMembers.length !== draftOrder.length) {
      throw new Error('Invalid member IDs in draft order');
    }

    // Match member IDs to their new draft order for update
    const offset = draftOrder.length + 100;
    const orderCase = sql`
  CASE ${leagueMemberSchema.memberId}
  ${sql.join(
      draftOrder.map((memberId, index) =>
        sql`WHEN ${memberId} THEN ${index + offset}::smallint`
      ),
      sql` `
    )}
  END
`;

    // first update everyone to a high number to avoid unique constraint issues
    const updatedHigh = await trx
      .update(leagueMemberSchema)
      .set({ draftOrder: orderCase })
      .where(and(
        eq(leagueMemberSchema.leagueId, auth.leagueId),
        inArray(leagueMemberSchema.memberId, draftOrder)
      ))
      .returning({ memberId: leagueMemberSchema.memberId });

    if (updatedHigh.length !== draftOrder.length) {
      throw new Error('Failed to update draft order');
    }

    // then shift them down to the correct order
    const updatedFinal = await trx
      .update(leagueMemberSchema)
      .set({
        draftOrder: sql`${leagueMemberSchema.draftOrder} - ${offset}::smallint`
      })
      .where(and(
        eq(leagueMemberSchema.leagueId, auth.leagueId),
        inArray(leagueMemberSchema.memberId, draftOrder)
      ))
      .returning({ memberId: leagueMemberSchema.memberId });

    if (updatedFinal.length !== draftOrder.length) {
      throw new Error('Failed to finalize draft order update');
    }

    return { success: true };
  });
}
