import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';


/**
  * Get the league name
  * @param hash - the hash of the league
  * @returns the league name
  * @returnObj `leagueName | undefined`
  */
export default async function getLeagueName(hash: string) {
  return await db
    .select({ leagueName: leagueSchema.name })
    .from(leagueSchema)
    .where(eq(leagueSchema.hash, hash))
    .then((leagues) => leagues[0]?.leagueName);
}
