import { and, eq, isNull } from 'drizzle-orm';
import 'server-only';

import { db } from '~/server/db';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { leagueSchema, leagueSettingsSchema } from '~/server/db/schema/leagues';
import { seasonSchema } from '~/server/db/schema/seasons';
import { type PublicLeague } from '~/types/leagues';

/**
  * Get the pending leagues that the user has requested to join
  * @param userId The user ID
  * @returns the pending leagues for the user
  * @returnObj `PublicLeague[]`
  */
export default async function getPendingLeagues(userId: string): Promise<PublicLeague[]> {
  const pendingLeagues = await db
    .select({
      name: leagueSchema.name,
      status: leagueSchema.status,
      season: seasonSchema.name,
      isProtected: leagueSettingsSchema.isProtected,
      hash: leagueSchema.hash,
      seasonId: leagueSchema.seasonId,
      userId: leagueMemberSchema.userId,
      draftOrder: leagueMemberSchema.draftOrder
    })
    .from(leagueMemberSchema)
    .innerJoin(leagueSchema, eq(leagueSchema.leagueId, leagueMemberSchema.leagueId))
    .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leagueSchema.leagueId))
    .innerJoin(seasonSchema, eq(seasonSchema.seasonId, leagueSchema.seasonId))
    .where(and(
      eq(leagueMemberSchema.userId, userId),
      isNull(leagueMemberSchema.draftOrder),
      eq(leagueSettingsSchema.isProtected, true),
      eq(leagueSchema.status, 'Predraft')
    ));

  return pendingLeagues.map((row) => ({
    ...row,
    isPending: true,
    isMember: false,
    usedColors: [],
  })) as PublicLeague[];
}



