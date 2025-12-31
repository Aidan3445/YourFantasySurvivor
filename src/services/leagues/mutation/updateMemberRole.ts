import 'server-only';

import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { type LeagueMemberRole } from '~/types/leagueMembers';

/**
  * Update a member's role
  * @param auth The authenticated league owner
  * @param memberId The ID of the member to update
  * @param newRole The new role to assign to the member
  * @throws an error if the role cannot be updated
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function updateRoleLogic(
  auth: VerifiedLeagueMemberAuth,
  memberId: number,
  newRole: LeagueMemberRole
) {
  if (auth.status === 'Inactive') throw new Error('League is inactive');
  if (auth.role !== 'Owner') throw new Error('Only league owners can update member roles');

  return await db.transaction(async (trx) => {
    await trx
      .update(leagueMemberSchema)
      .set({ role: newRole })
      .where(and(
        eq(leagueMemberSchema.leagueId, auth.leagueId),
        eq(leagueMemberSchema.memberId, memberId)
      ));

    // if we are updating to owner, demote current user/owner to admin
    // we can assume that the owner has approved this action before calling this function
    if (newRole === 'Owner') {
      await trx
        .update(leagueMemberSchema)
        .set({ role: 'Admin' })
        .where(and(
          eq(leagueMemberSchema.leagueId, auth.leagueId),
          eq(leagueMemberSchema.memberId, auth.memberId)
        ));
    }

    return { success: true };
  });
}
