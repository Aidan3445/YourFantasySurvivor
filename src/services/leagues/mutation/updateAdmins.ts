'use server';

import { db } from '~/server/db';
import { and, eq, inArray, not, notInArray } from 'drizzle-orm';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
  * Update league admin list
  * @param auth The authenticated league member
  * @param admins The new list of admins
  * @throws an error if the admins cannot be updated
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function updateAdminsLogic(
  auth: VerifiedLeagueMemberAuth,
  admins: number[]
) {
  // Create transaction
  return await db.transaction(async (trx) => {
    // Demote the old admins not in the list
    await trx
      .update(leagueMemberSchema)
      .set({ role: 'Member' })
      .where(and(
        eq(leagueMemberSchema.leagueId, auth.leagueId),
        notInArray(leagueMemberSchema.memberId, admins),
        eq(leagueMemberSchema.role, 'Admin')));
    // Promote the new admins
    const newAdmins = await trx
      .update(leagueMemberSchema)
      .set({ role: 'Admin' })
      .where(and(
        eq(leagueMemberSchema.leagueId, auth.leagueId),
        not(eq(leagueMemberSchema.role, 'Owner')),
        not(eq(leagueMemberSchema.role, 'Admin')),
        inArray(leagueMemberSchema.memberId, admins)))
      .returning({ memberId: leagueMemberSchema.memberId });

    // Validate the number of admins
    if (newAdmins.length !== admins.length) {
      throw new Error('Failed to update admins');
    }

    return { success: true };
  });
}
