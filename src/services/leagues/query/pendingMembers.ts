import 'server-only';

import { db } from '~/server/db';
import { and, eq, isNull } from 'drizzle-orm';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { type DBTransaction } from '~/types/server';

/**
   * Get the pending league members by its hash
   * @param auth The authenticated league member
   * @param trxOverride - optional transaction override for nesting
   * @returns the pending league members
   * @throws an error if the user is not authenticated
   * @returnObj `LeagueMember[]`
   */
export default async function getPendingMembers(
  auth: VerifiedLeagueMemberAuth,
  trxOverride?: DBTransaction
) {
  if (auth.role === 'Member') throw new Error('Not authorized to view pending members');

  const pendingMembers = (trxOverride ?? db)
    .select({
      memberId: leagueMemberSchema.memberId,
      displayName: leagueMemberSchema.displayName,
      color: leagueMemberSchema.color,
      updateAt: leagueMemberSchema.updated_at,
    })
    .from(leagueMemberSchema)
    .where(and(
      eq(leagueMemberSchema.leagueId, auth.leagueId),
      isNull(leagueMemberSchema.draftOrder)))
    .orderBy(leagueMemberSchema.draftOrder);

  // pending members are hidden after 7 days
  // a user can re-join to try again after that period
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return pendingMembers.then((members) => members.filter((member) => {
    return member.updateAt >= sevenDaysAgo;
  }));
}
