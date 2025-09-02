import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { type LeagueMember } from '~/types/leagueMembers';

/**
   * Get a league members by its hash
   * @param hash The hash of the league
   * @returns the league members
   * @throws an error if the user is not authenticated
   * @returnObj `LeagueMember[]`
   */
export default async function getLeague(hash: string) {
  return db
    .select({
      memberId: leagueMemberSchema.memberId,
      displayName: leagueMemberSchema.displayName,
      color: leagueMemberSchema.color,
      role: leagueMemberSchema.role,
      draftOrder: leagueMemberSchema.draftOrder
    })
    .from(leagueMemberSchema)
    .innerJoin(leagueSchema, eq(leagueMemberSchema.leagueId, leagueSchema.leagueId))
    .where(eq(leagueSchema.hash, hash))
    .then((members) => members as LeagueMember[]);
}
