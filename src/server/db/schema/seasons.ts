import { createTable } from './createTable';
import { date, serial, varchar } from 'drizzle-orm/pg-core';

export const seasons = createTable(
  'season',
  {
    id: serial('season_id').notNull().primaryKey(),
    name: varchar('name', { length: 64 }).notNull(),
    premierDate: date('premier_date').notNull(),
    finaleDate: date('finale_date'),
  }
);
export type Season = typeof seasons.$inferSelect;

