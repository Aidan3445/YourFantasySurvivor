import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { type LeagueMember } from '~/types/leagueMembers';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
   * Get a league members by its hash
   * @param auth The authenticated league member
   * @returns the league members
   * @throws an error if the user is not authenticated
   * @returnObj `LeagueMember[]`
   */
export default async function getLeague(auth: VerifiedLeagueMemberAuth) {
  return db
    .select({
      memberId: leagueMemberSchema.memberId,
      displayName: leagueMemberSchema.displayName,
      color: leagueMemberSchema.color,
      role: leagueMemberSchema.role,
      draftOrder: leagueMemberSchema.draftOrder
    })
    .from(leagueMemberSchema)
    .where(eq(leagueMemberSchema.leagueId, auth.leagueId))
    .then((members) => members as LeagueMember[]);
}
