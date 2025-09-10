import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { seasonSchema } from '~/server/db/schema/seasons';
import getUsedColors from '~/services/leagues/query/colors';
import { type PublicLeague } from '~/types/leagues';

/**
  * Get the public data for a league
  * @param hash The hash of the league
  * @returns the public data for the league
  * @returnObj `PublicLeague | null`
  */
export default async function getPublicLeague(hash: string) {
  const colorsReq = getUsedColors(hash);
  const leagueReq = db
    .select({
      name: leagueSchema.name,
      status: leagueSchema.status,
      season: seasonSchema.name,
    })
    .from(leagueSchema)
    .innerJoin(seasonSchema, eq(leagueSchema.seasonId, seasonSchema.seasonId))
    .where(eq(leagueSchema.hash, hash));

  const [colors, league] = await Promise.all([colorsReq, leagueReq]);

  if (league.length === 0) return null;

  return {
    ...league[0],
    usedColors: colors,
  } as PublicLeague;
}

