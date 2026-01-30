import 'server-only';

import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import { leagueSchema, leagueSettingsSchema } from '~/server/db/schema/leagues';
import { seasonSchema } from '~/server/db/schema/seasons';
import getUsedColors from '~/services/leagues/query/colors';
import { type PublicLeague } from '~/types/leagues';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';

/**
  * Get the public data for a league
  * @param hash The hash of the league
  * @param userId The requesting user ID (optional)
  * @returns the public data for the league
  * @returnObj `PublicLeague | null`
  */
export default async function getPublicLeague(hash: string, userId?: string | null) {
  const colorsReq = getUsedColors(hash);
  const leagueReq = db
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
    .from(leagueSchema)
    .innerJoin(seasonSchema, eq(leagueSchema.seasonId, seasonSchema.seasonId))
    .innerJoin(leagueSettingsSchema, eq(leagueSchema.leagueId, leagueSettingsSchema.leagueId))
    .leftJoin(leagueMemberSchema, and(
      eq(leagueSchema.leagueId, leagueMemberSchema.leagueId),
      userId
        ? eq(leagueMemberSchema.userId, userId)
        : eq(leagueMemberSchema.userId, '<NULL>')
    ))
    .where(eq(leagueSchema.hash, hash));

  const [colors, league] = await Promise.all([colorsReq, leagueReq]);

  if (!league[0]) return null;

  const row = league[0];
  console.log(`Fetched public data for league: ${row.name} (Hash: ${row.hash})`, {
    row,
    colors
  });

  const isPending = row.draftOrder === null && !!row.userId && row.isProtected;
  const isMember = !!row.userId && !isPending;

  return { ...row, isPending, isMember, usedColors: colors } as PublicLeague;
}

