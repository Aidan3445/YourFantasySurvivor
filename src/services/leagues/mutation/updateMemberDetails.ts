'use server';

import { db } from '~/server/db';
import { and, eq, or } from 'drizzle-orm';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { type LeagueMemberInsert } from '~/types/leagueMembers';

/**
  * Update league member details
  * @param auth The authenticated league member
  * @param member The member to update
  * @throws an error if the member cannot be updated
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function updateMemberDetailsLogic(
  auth: VerifiedLeagueMemberAuth,
  member: LeagueMemberInsert
) {
  // Error can be ignored, the where clause is not understood by the type system
  const update = await db
    .update(leagueMemberSchema)
    .set(member)
    .where(or(
      eq(leagueMemberSchema.memberId, auth.memberId),
      and(
        eq(leagueMemberSchema.leagueId, auth.leagueId),
        eq(leagueMemberSchema.role, 'Owner'))))
    .returning({
      memberId: leagueMemberSchema.memberId,
    });

  if (update.length === 0) {
    throw new Error('Failed to update member details');
  }

  return { success: true };
}
