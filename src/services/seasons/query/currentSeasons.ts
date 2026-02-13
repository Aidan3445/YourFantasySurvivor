import 'server-only';

import { db } from '~/server/db';
import { and, asc, gte, isNull, lte, ne, or } from 'drizzle-orm';
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
  // We consider seasons starting within the next 3 months as current
  const threeMonthsFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

  return db
    .select()
    .from(seasonSchema)
    .where(and(
      ne(seasonSchema.seasonId, process.env.NODE_ENV === 'production' ? 0 : -1),
      lte(seasonSchema.premiereDate, threeMonthsFromNow),
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
