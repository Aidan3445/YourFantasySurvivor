import 'server-only';

import { createTable } from '~/server/db/schema/createTable';
import { seasonsSchema } from '~/server/db/schema/seasons';
import { integer, serial, varchar } from 'drizzle-orm/pg-core';

export const tribesSchema = createTable(
  'tribe',
  {
    tribeId: serial('tribe_id').notNull().primaryKey(),
    tribeName: varchar('name', { length: 16 }).notNull(),
    tribeColor: varchar('color', { length: 7 }).notNull(),
    // null seasonId for production or anything else to be shared across seasons
    seasonId: integer('season_id').references(() => seasonsSchema.seasonId, { onDelete: 'cascade' })
  }
);

