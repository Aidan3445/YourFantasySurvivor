import { asc, eq, isNull, or } from 'drizzle-orm';
import 'server-only';

import { db } from '~/server/db';
import { tribeSchema } from '~/server/db/schema/tribes';
import { type Tribe } from '~/types/tribes';


/**
* Get all tribes for a season
* @param seasonId The season to get tribes from
* @returns The tribes for the season
* @throws if the season does not exist
* @returnObj `Tribe[]`
*/
export default async function getTribes(seasonId: number) {
  return db
    .select()
    .from(tribeSchema)
    .where(or(
      eq(tribeSchema.seasonId, seasonId),
      isNull(tribeSchema.seasonId)))
    .orderBy(asc(tribeSchema.tribeName)) as Promise<Tribe[]>;
}
