import 'server-only';
import { createTable } from './createTable';
import { seasonsSchema } from './seasons';
import { integer, pgEnum, serial, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
import { sql } from 'drizzle-orm';
import { DEFAULT_SURVIVAL_CAP, DraftTimingOptions } from '../defs/leagues';

export const leaguesSchema = createTable(
  'league',
  {
    leagueId: serial('league_id').primaryKey(),
    leagueHash: varchar('league_hash', { length: 16 }).notNull().$defaultFn(() => nanoid(16)),
    leagueName: varchar('league_name', { length: 64 }).notNull(),
    leagueSeason: integer('season_id').references(() => seasonsSchema.seasonId, { onDelete: 'cascade' }).notNull(),
  },
  (table) => [
    uniqueIndex().on(table.leagueHash),
  ]
);

export const draftTiming = pgEnum('draft_timing', DraftTimingOptions);

export const leagueSettingsSchema = createTable(
  'league_settings',
  {
    leagueId: integer('league_id')
      .references(() => leaguesSchema.leagueId, { onDelete: 'cascade' })
      .primaryKey(),
    draftTiming: draftTiming('draft_timing').notNull().default('After Premiere'),
    draftDate: timestamp('draft_date', { mode: 'string' }),
    draftOrder: integer('draft_order').array().notNull().default(sql`ARRAY[]::integer[]`),
    survivalCap: integer('survival_cap').notNull().default(DEFAULT_SURVIVAL_CAP),
  }
);
