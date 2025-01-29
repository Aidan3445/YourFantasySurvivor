import { createTable } from './createTable';
import { serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const seasons = createTable(
  'season',
  {
    seasonId: serial('season_id').notNull().primaryKey(),
    seasonName: varchar('name', { length: 64 }).notNull(),
    premierDate: timestamp('premier_date', { mode: 'string' }).notNull(),
    finaleDate: timestamp('finale_date', { mode: 'string' }),
  }
);

export type Season = typeof seasons.$inferSelect;
export type SeasonInsert = Omit<typeof seasons.$inferInsert, 'seasonId'>;


