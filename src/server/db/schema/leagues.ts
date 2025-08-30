import 'server-only';

import { createTable } from '~/server/db/schema/createTable';
import { seasonsSchema } from '~/server/db/schema/seasons';
import { boolean, integer, pgEnum, serial, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
import { sql } from 'drizzle-orm';
import { DEFAULT_SURVIVAL_CAP, LeagueStatusOptions } from '~/types/leagues';

export const leagueStatus = pgEnum('league_status', LeagueStatusOptions);

export const leaguesSchema = createTable(
  'league',
  {
    leagueId: serial('league_id').primaryKey(),
    leagueHash: varchar('league_hash', { length: 16 }).notNull().$defaultFn(() => nanoid(16)),
    leagueName: varchar('league_name', { length: 64 }).notNull(),
    leagueSeason: integer('season_id').references(() => seasonsSchema.seasonId, { onDelete: 'cascade' }).notNull(),
    leagueStatus: leagueStatus('league_status').notNull().default('Predraft'),
  },
  (table) => [
    uniqueIndex('league_hash_idx').on(table.leagueHash),
  ]
);

export const leagueSettingsSchema = createTable(
  'league_settings',
  {
    leagueId: integer('league_id')
      .references(() => leaguesSchema.leagueId, { onDelete: 'cascade' })
      .primaryKey(),
    draftDate: timestamp('draft_date', { mode: 'string' }),
    draftOrder: integer('draft_order').array().notNull().default(sql`ARRAY[]::integer[]`),
    survivalCap: integer('survival_cap').notNull().default(DEFAULT_SURVIVAL_CAP),
    preserveStreak: boolean('preserve_streak').notNull().default(true),
  }
);
