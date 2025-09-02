import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { seasonsSchema } from '~/server/db/schema/seasons';

/**
   * Get a league by its hash
   * @param hash The hash of the league
   * @returns the league
   * @throws an error if the user is not authenticated
   * @returnObj `League | undefined`
   */
export default async function getLeague(hash: string) {
  return db
    .select({
      leagueId: leagueSchema.leagueId,
      hash: leagueSchema.hash,
      name: leagueSchema.name,
      status: leagueSchema.status,
      season: seasonsSchema.name
    })
    .from(leagueSchema)
    .innerJoin(seasonsSchema, eq(leagueSchema.season, seasonsSchema.seasonId))
    .where(eq(leagueSchema.hash, hash))
    .then((leagues) => leagues[0]);
}
