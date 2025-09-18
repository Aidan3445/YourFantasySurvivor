import 'server-only';

import { createTable } from '~/server/db/schema/createTable';
import { seasonSchema } from '~/server/db/schema/seasons';
import { boolean, integer, serial, smallint, timestamp, unique, varchar } from 'drizzle-orm/pg-core';

export const episodeSchema = createTable(
  'episode',
  {
    episodeId: serial('episode_id').notNull().primaryKey(),
    episodeNumber: smallint('number').notNull(),
    title: varchar('title', { length: 64 }).notNull(),
    airDate: timestamp('air_date', { mode: 'string' }).notNull(),
    runtime: smallint('runtime').default(90).notNull(),
    isMerge: boolean('merge').default(false).notNull(),
    isFinale: boolean('finale').default(false).notNull(),
    seasonId: integer('season_id').references(() => seasonSchema.seasonId, { onDelete: 'cascade' }).notNull(),
  },
  (table) => [
    unique('ep_season_number_unq').on(table.seasonId, table.episodeNumber),
  ]
);
