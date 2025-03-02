import 'server-only';
import { createTable } from './createTable';
import { seasonsSchema } from './seasons';
import { integer, serial, varchar } from 'drizzle-orm/pg-core';

export const tribesSchema = createTable(
  'tribe',
  {
    tribeId: serial('tribe_id').notNull().primaryKey(),
    tribeName: varchar('name', { length: 16 }).notNull(),
    tribeColor: varchar('color', { length: 7 }).notNull(),
    seasonId: integer('season_id').references(() => seasonsSchema.seasonId, { onDelete: 'cascade' }).notNull(),
  }
);

