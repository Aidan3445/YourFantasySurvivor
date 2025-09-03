import 'server-only';

import { db } from '~/server/db';
import { desc, eq } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { seasonSchema } from '~/server/db/schema/seasons';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { auth } from '~/lib/auth';
import { type League } from '~/types/leagues';
import { type LeagueMember } from '~/types/leagueMembers';


/**
  * Get the leagues that you're a member of
  * @returns the leagues you're a member of
  * @returnObj `{League, LeagueMember}[]`
  */
export default async function getUserLeagues() {
  const { userId } = await auth();
  if (!userId) return [];

  return db
    .select({
      league: {
        leagueId: leagueSchema.leagueId,
        name: leagueSchema.name,
        hash: leagueSchema.hash,
        status: leagueSchema.status,
        season: seasonSchema.name,
      },
      member: {
        memberId: leagueMemberSchema.memberId,
        displayName: leagueMemberSchema.displayName,
        color: leagueMemberSchema.color,
        role: leagueMemberSchema.role,
        draftOrder: leagueMemberSchema.draftOrder,
      }
    })
    .from(leagueMemberSchema)
    .innerJoin(leagueSchema, eq(leagueSchema.leagueId, leagueMemberSchema.leagueId))
    .innerJoin(seasonSchema, eq(seasonSchema.seasonId, leagueSchema.season))
    .where(eq(leagueMemberSchema.userId, userId))
    .orderBy(desc(seasonSchema.premiereDate))
    .then((rows) => rows as { league: League, member: LeagueMember }[]);
}


