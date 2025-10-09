import 'server-only';

import { db } from '~/server/db';
import { and, asc, gte, isNull, lte, or } from 'drizzle-orm';
import { seasonSchema } from '~/server/db/schema/seasons';
import { type Season } from '~/types/seasons';
import { unstable_cache } from 'next/cache';

/**
  * Get the current seasons
  * @returns The current seasons
  * @returObj `Season[]`
  */
export default async function getCurrentSeasons() {
  return unstable_cache(
    async () => fetchCurrentSeasons(),
    ['current-seasons'],
    {
      revalidate: 3600, // 1 hour
      tags: ['seasons', 'current-seasons']
    }
  )();
}

async function fetchCurrentSeasons() {
  const now = new Date().toISOString();

  return db
    .select()
    .from(seasonSchema)
    .where(and(
      lte(seasonSchema.premiereDate, now),
      or(
        isNull(seasonSchema.finaleDate),
        gte(seasonSchema.finaleDate, now))))
    .orderBy(asc(seasonSchema.premiereDate))
    .then(rows => rows.map(row => ({
      ...row,
      premiereDate: new Date(`${row.premiereDate} Z`),
      finaleDate: row.finaleDate ? new Date(`${row.finaleDate} Z`) : null
    } as Season)));
}
