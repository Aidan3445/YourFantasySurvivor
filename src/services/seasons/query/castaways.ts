import 'server-only';

import { db } from '~/server/db';
import { asc, eq, isNull, or } from 'drizzle-orm';
import { castawaySchema } from '~/server/db/schema/castaways';
import { type Castaway } from '~/types/castaways';
import { unstable_cache } from 'next/cache';

/**
  * Get the castaways for the season and caches the result
  * @param seasonId The season to get castaways from
  * @returns The castaways for the season
  * @returnObj `Castaway[]`
  */
export default async function getCastaways(seasonId: number) {
  return unstable_cache(
    async (sid: number) => fetchCastaways(sid),
    ['castaways', seasonId.toString()],
    {
      revalidate: false,
      tags: [`castaways-${seasonId}`, 'castaways']
    }
  )(seasonId);
}

async function fetchCastaways(seasonId: number) {
  return db
    .select()
    .from(castawaySchema)
    .where(or(
      eq(castawaySchema.seasonId, seasonId),
      isNull(castawaySchema.seasonId)))
    .orderBy(asc(castawaySchema.fullName)) as Promise<Castaway[]>;
}
