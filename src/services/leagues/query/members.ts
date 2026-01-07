import 'server-only';

import { db } from '~/server/db';
import { and, eq, isNotNull, sql } from 'drizzle-orm';
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
export default async function getLeagueMembers(auth: VerifiedLeagueMemberAuth) {
  return db
    .select({
      memberId: leagueMemberSchema.memberId,
      displayName: leagueMemberSchema.displayName,
      color: leagueMemberSchema.color,
      role: leagueMemberSchema.role,
      draftOrder: leagueMemberSchema.draftOrder,
      loggedIn: sql<boolean>`CASE WHEN 
         ${leagueMemberSchema.memberId} = ${auth.memberId}
         THEN true ELSE false END`.as('loggedIn'),
    })
    .from(leagueMemberSchema)
    .where(and(
      eq(leagueMemberSchema.leagueId, auth.leagueId),
      isNotNull(leagueMemberSchema.draftOrder)))
    .orderBy(leagueMemberSchema.draftOrder)
    .then((members) => members.map((member) => ({
      ...member,
      // override role for logged in user
      role: member.memberId === auth.memberId ? auth.role : member.role,
    }) as LeagueMember));
}
