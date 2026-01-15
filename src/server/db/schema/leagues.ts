import 'server-only';

import { createTable } from '~/server/db/schema/createTable';
import { seasonSchema } from '~/server/db/schema/seasons';
import { boolean, integer, pgEnum, serial, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
import {
  DEFAULT_SURVIVAL_CAP,
  LeagueStatuses,
  DEFAULT_SECONDARY_PICK_ENABLED,
  DEFAULT_SECONDARY_PICK_CAN_PICK_OWN,
  DEFAULT_SECONDARY_PICK_LOCKOUT_PERIOD,
  DEFAULT_SECONDARY_PICK_PUBLIC_PICKS,
  DEFAULT_SECONDARY_PICK_MULTIPLIER
} from '~/lib/leagues';

export const leagueStatus = pgEnum('league_status', LeagueStatuses);

export const leagueSchema = createTable(
  'league',
  {
    leagueId: serial('league_id').primaryKey(),
    hash: varchar('league_hash', { length: 16 }).notNull().$defaultFn(() => nanoid(16)),
    name: varchar('league_name', { length: 64 }).notNull(),
    status: leagueStatus('league_status').notNull().default('Predraft'),
    seasonId: integer('season_id').references(() => seasonSchema.seasonId, { onDelete: 'cascade' }).notNull(),
    startWeek: integer('start_week')
  },
  (table) => [
    uniqueIndex('league_hash_unq_idx').on(table.hash),
  ]
);

export const leagueSettingsSchema = createTable(
  'league_settings',
  {
    leagueId: integer('league_id').references(() => leagueSchema.leagueId, { onDelete: 'cascade' }).primaryKey(),
    isProtected: boolean('protected').notNull().default(true),
    draftDate: timestamp('draft_date', { mode: 'string' }),
    survivalCap: integer('survival_cap').notNull().default(DEFAULT_SURVIVAL_CAP),
    preserveStreak: boolean('preserve_streak').notNull().default(true),
    secondaryPickEnabled: boolean('secondary_pick_enabled').notNull().default(DEFAULT_SECONDARY_PICK_ENABLED),
    secondaryPickCanPickOwn: boolean('secondary_pick_can_pick_own').notNull().default(DEFAULT_SECONDARY_PICK_CAN_PICK_OWN),
    secondaryPickLockoutPeriod: integer('secondary_pick_lockout_period').notNull().default(DEFAULT_SECONDARY_PICK_LOCKOUT_PERIOD),
    secondaryPickPublicPicks: boolean('secondary_pick_public_picks').notNull().default(DEFAULT_SECONDARY_PICK_PUBLIC_PICKS),
    secondaryPickMultiplier: integer('secondary_pick_multiplier').notNull().default(DEFAULT_SECONDARY_PICK_MULTIPLIER * 100), // stored as percentage: 25, 50, 75, 100
  }
);
