import 'server-only';

import { db } from '~/server/db';
import { desc, eq } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { seasonsSchema } from '~/server/db/schema/seasons';
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
        season: seasonsSchema.name,
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
    .innerJoin(seasonsSchema, eq(seasonsSchema.seasonId, leagueSchema.season))
    .where(eq(leagueMemberSchema.userId, userId))
    .orderBy(desc(seasonsSchema.premiereDate))
    .then((rows) => rows as { league: League, member: LeagueMember }[]);
}


