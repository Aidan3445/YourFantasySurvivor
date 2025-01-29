import { createTable } from './createTable';
import { seasons } from './seasons';
import { integer, serial, varchar } from 'drizzle-orm/pg-core';

export const tribes = createTable(
  'tribe',
  {
    tribeId: serial('tribe_id').notNull().primaryKey(),
    name: varchar('name', { length: 16 }).notNull(),
    color: varchar('color', { length: 7 }).notNull(),
    season: integer('season_id').references(() => seasons.seasonId, { onDelete: 'cascade' }).notNull(),
  }
);
export type Tribe = typeof tribes.$inferSelect;
export type TribeInsert = Omit<typeof tribes.$inferInsert, 'tribeId'>;

