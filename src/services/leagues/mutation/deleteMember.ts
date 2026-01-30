import 'server-only';

import { db } from '~/server/db';
import { and, eq, gt, isNotNull } from 'drizzle-orm';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
  * Delete a member from a league
  * @param auth The authenticated league admin
  * @param memberId The ID of the member to delete
  * @throws an error if the member cannot be deleted
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function deleteMemberLogic(
  auth: VerifiedLeagueMemberAuth,
  memberId: number,
) {
  if (auth.status === 'Inactive') throw new Error('League is inactive');
  if (auth.role === 'Member') throw new Error('Only league owners and admins can delete members');
  if (auth.memberId === memberId && auth.role === 'Owner') throw new Error('Owners cannot delete themselves');

  await db.transaction(async (trx) => {
    // confirm member to delete is not owner or admin if auth is admin
    const memberToDelete = await trx
      .select()
      .from(leagueMemberSchema)
      .where(and(
        eq(leagueMemberSchema.leagueId, auth.leagueId),
        eq(leagueMemberSchema.memberId, memberId),
        auth.role === 'Admin'
          ? eq(leagueMemberSchema.role, 'Member')
          : isNotNull(leagueMemberSchema.memberId)
      ));
    if (memberToDelete.length === 0) {
      throw new Error('Not a league member or insufficient permissions to delete');
    }
    if (memberToDelete.length > 1) {
      throw new Error('Multiple league members should not have been matched');
    }

    // delete the member
    await trx
      .delete(leagueMemberSchema)
      .where(and(
        eq(leagueMemberSchema.leagueId, auth.leagueId),
        eq(leagueMemberSchema.memberId, memberId)
      ));

    // If the draft order is not null, we need to increment the draft positions of members below the deleted member
    if (memberToDelete[0]!.draftOrder !== null) {
      const laterMembers = await trx
        .select()
        .from(leagueMemberSchema)
        .where(and(
          eq(leagueMemberSchema.leagueId, auth.leagueId),
          gt(leagueMemberSchema.draftOrder, memberToDelete[0]!.draftOrder)
        ));

      await Promise.all(laterMembers.map(async (member) => {
        await trx
          .update(leagueMemberSchema)
          .set({ draftOrder: member.draftOrder! - 1 })
          .where(and(
            eq(leagueMemberSchema.leagueId, auth.leagueId),
            eq(leagueMemberSchema.memberId, member.memberId)
          ));
      }));
    }
  });

  return { success: true };
}
