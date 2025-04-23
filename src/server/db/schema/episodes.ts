import 'server-only';

import { createTable } from './createTable';
import { seasonsSchema } from './seasons';
import { boolean, integer, serial, smallint, timestamp, unique, varchar } from 'drizzle-orm/pg-core';

export const episodesSchema = createTable(
  'episode',
  {
    episodeId: serial('episode_id').notNull().primaryKey(),
    episodeNumber: smallint('number').notNull(),
    title: varchar('title', { length: 64 }).notNull(),
    airDate: timestamp('air_date', { mode: 'string' }).notNull(),
    runtime: smallint('runtime').default(90).notNull(),
    seasonId: integer('season_id').references(() => seasonsSchema.seasonId, { onDelete: 'cascade' }).notNull(),
    isMerge: boolean('merge').default(false).notNull(),
    isFinale: boolean('finale').default(false).notNull(),
  },
  (table) => [
    unique().on(table.seasonId, table.episodeNumber),
  ]
);
