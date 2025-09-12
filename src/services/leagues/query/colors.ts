import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';

/**
  * Get all colors currently in use by league members
  * @param hash The hash of the league
  * @returns array of colors in use
  * @returnObj `colors[]`
  */
export default async function getUsedColors(hash: string) {
  return db
    .select({
      color: leagueMemberSchema.color,
    })
    .from(leagueMemberSchema)
    .innerJoin(leagueSchema, eq(leagueMemberSchema.leagueId, leagueSchema.leagueId))
    .where(eq(leagueSchema.hash, hash))
    .then((members) => members.map(m => m.color));
}
