import 'server-only';

import { db } from '~/server/db';
import { asc } from 'drizzle-orm';
import { seasonsSchema } from '~/server/db/schema/seasons';
import { type Season } from '~/types/seasons';

/**
  * Get all seasons
  * @returns All seasons
  * @returObj `Season[]`
  */
export default async function getAllSeasons() {
  return db
    .select()
    .from(seasonsSchema)
    .orderBy(asc(seasonsSchema.premiereDate))
    .then(rows => rows.map(row => ({
      ...row,
      premiereDate: new Date(`${row.premiereDate} Z`),
      finaleDate: row.finaleDate ? new Date(`${row.finaleDate} Z`) : null
    } as Season)));
}
