import 'server-only';

import { createTable } from '~/server/db/schema/createTable';
import { seasonSchema } from '~/server/db/schema/seasons';
import { boolean, integer, pgEnum, serial, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
import { DEFAULT_SURVIVAL_CAP, LeagueStatuses } from '~/lib/leagues';

export const leagueStatus = pgEnum('league_status', LeagueStatuses);

export const leagueSchema = createTable(
  'league',
  {
    leagueId: serial('league_id').primaryKey(),
    hash: varchar('league_hash', { length: 16 }).notNull().$defaultFn(() => nanoid(16)),
    name: varchar('league_name', { length: 64 }).notNull(),
    status: leagueStatus('league_status').notNull().default('Predraft'),
    season: integer('season_id').references(() => seasonSchema.seasonId, { onDelete: 'cascade' }).notNull(),
  },
  (table) => [
    uniqueIndex('league_hash_idx').on(table.hash),
  ]
);

export const leagueSettingsSchema = createTable(
  'league_settings',
  {
    leagueId: integer('league_id').references(() => leagueSchema.leagueId, { onDelete: 'cascade' }).primaryKey(),
    draftDate: timestamp('draft_date', { mode: 'string' }),
    survivalCap: integer('survival_cap').notNull().default(DEFAULT_SURVIVAL_CAP),
    preserveStreak: boolean('preserve_streak').notNull().default(true)
  }
);
