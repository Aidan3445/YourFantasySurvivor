import 'server-only';

import { db } from '~/server/db';
import { and, eq, isNull } from 'drizzle-orm';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
   * Get the pending league members by its hash
   * @param auth The authenticated league member
   * @returns the pending league members
   * @throws an error if the user is not authenticated
   * @returnObj `LeagueMember[]`
   */
export default async function getPendingMembers(auth: VerifiedLeagueMemberAuth) {
  if (auth.role === 'Member') throw new Error('Not authorized to view pending members');

  const t = db
    .select({
      memberId: leagueMemberSchema.memberId,
      displayName: leagueMemberSchema.displayName,
      color: leagueMemberSchema.color
    })
    .from(leagueMemberSchema)
    .where(and(
      eq(leagueMemberSchema.leagueId, auth.leagueId),
      isNull(leagueMemberSchema.draftOrder)))
    .orderBy(leagueMemberSchema.draftOrder);
  console.log('T', t);
  return t;
}
