import 'server-only';

import { db } from '~/server/db';
import { and, asc, gte, isNull, lte, or } from 'drizzle-orm';
import { seasonsSchema } from '~/server/db/schema/seasons';
import { type Season } from '~/types/seasons';

/**
  * Get the current seasons
  * @returns The current seasons
  * @returObj `Season[]`
  */
export default async function getCurrentSeasons() {
  const now = new Date().toISOString();

  return db
    .select()
    .from(seasonsSchema)
    .where(and(
      lte(seasonsSchema.premiereDate, now),
      or(
        isNull(seasonsSchema.finaleDate),
        gte(seasonsSchema.finaleDate, now)
      )
    ))
    .orderBy(asc(seasonsSchema.premiereDate))
    .then(rows => rows.map(row => ({
      ...row,
      premiereDate: new Date(`${row.premiereDate} Z`),
      finaleDate: row.finaleDate ? new Date(`${row.finaleDate} Z`) : null
    } as Season)));
}
