import 'server-only';

import { createTable } from './createTable';
import { serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const seasonsSchema = createTable(
  'season',
  {
    seasonId: serial('season_id').notNull().primaryKey(),
    seasonName: varchar('name', { length: 64 }).notNull(),
    premiereDate: timestamp('premier_date', { mode: 'string' }).notNull(),
    finaleDate: timestamp('finale_date', { mode: 'string' }),
  }
);


