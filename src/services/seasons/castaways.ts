import 'server-only';

import { db } from '~/server/db';
import { asc, eq, isNull, or } from 'drizzle-orm';
import { castawaySchema } from '~/server/db/schema/castaways';
import { type Castaway } from '~/types/castaways';

/**
  * Get the castaways for the season
  * @param seasonId The season to get castaways from
  * @returns The castaways for the season
  * @returnObj `Castaway[]`
  */
export default async function getCastaways(seasonId: number) {
  return db
    .select()
    .from(castawaySchema)
    .where(or(
      eq(castawaySchema.seasonId, seasonId),
      isNull(castawaySchema.seasonId)))
    .orderBy(asc(castawaySchema.fullName)) as Promise<Castaway[]>;
}
