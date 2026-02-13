import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
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
  if (auth.status === 'Inactive') throw new Error('League is inactive');

  const update = await db
    .update(leagueMemberSchema)
    .set({
      displayName: member.displayName.trim(),
      color: member.color,
    })
    .where(eq(leagueMemberSchema.memberId, auth.memberId))
    .returning({
      memberId: leagueMemberSchema.memberId,
    });

  if (update.length === 0) {
    throw new Error('Failed to update member details');
  }

  return { success: true };
}
