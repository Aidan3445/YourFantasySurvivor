import { z } from 'zod';
import { createTable } from './createTable';
import { seasons } from './seasons';
import { integer, pgEnum, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
import { sql } from 'drizzle-orm';

export const leagues = createTable(
  'league',
  {
    id: serial('league_id').notNull().primaryKey(),
    name: varchar('name', { length: 64 }).notNull().unique(),
    season: integer('season_id').references(() => seasons.seasonId, { onDelete: 'cascade' }).notNull(),
  }
);
export type League = typeof leagues.$inferSelect;
export type LeagueInsert = typeof leagues.$inferInsert;

export const reference = pgEnum('reference', ['castaway', 'tribe', 'member']);
export type Reference = (typeof reference.enumValues)[number];

export const baseEventRules = createTable(
  'event_base_rule',
  {
    id: serial('base_rule_id').notNull().primaryKey(),
    league: integer('league_id').references(() => leagues.id, { onDelete: 'cascade' }).notNull(),
    // point values for all the base events
    advFound: integer('adv_found').notNull(),
    advPlay: integer('adv_play').notNull(),
    badAdvPlay: integer('bad_adv_play').notNull(),
    advElim: integer('adv_elim').notNull(),
    spokeEpTitle: integer('spoke_ep_title').notNull(),
    tribe1st: integer('tribe_1st').notNull(),
    tribe2nd: integer('tribe_2nd').notNull(),
    indivWin: integer('indiv_win').notNull(),
    indivReward: integer('indiv_reward').notNull(),
    finalists: integer('finalists').notNull(),
    fireWin: integer('fire_win').notNull(),
    soleSurvivor: integer('sole_survivor').notNull(),
  }
);

export const pointRange = z.coerce.number()
  .max(512, { message: 'Points must not exceed ±512' })
  .min(-512, { message: 'Points must not exceed ±512' });

export const BaseEventRule = z.object({
  advFound: pointRange,
  advPlay: pointRange,
  badAdvPlay: pointRange,
  advElim: pointRange,
  spokeEpTitle: pointRange,
  tribe1st: pointRange,
  tribe2nd: pointRange,
  indivWin: pointRange,
  indivReward: pointRange,
  finalists: pointRange,
  fireWin: pointRange,
  soleSurvivor: pointRange,
});

export type BaseEventRuleType = z.infer<typeof BaseEventRule>;

export const defaultBaseRules: BaseEventRuleType = {
  advFound: 5,
  advPlay: 10,
  badAdvPlay: -5,
  advElim: -10,
  spokeEpTitle: 2,
  tribe1st: 2,
  tribe2nd: 1,
  indivWin: 10,
  indivReward: 5,
  finalists: 5,
  fireWin: 5,
  soleSurvivor: 10,
};

export const DEFAULT_SURVIVAL_CAP = 5;

const draftTiming = pgEnum('draft_timing', ['Before Premier', 'After Premier']);
export const DraftTimingOptions = draftTiming.enumValues;
export type DraftTiming = (typeof draftTiming.enumValues)[number];

export const leagueSettings = createTable(
  'league_settings',
  {
    league: integer('league_id').references(() => leagues.id, { onDelete: 'cascade' }).notNull().primaryKey(),
    draftTiming: draftTiming('draft_timing').notNull().default('Before Premier'),
    draftDate: timestamp('draft_date', { mode: 'string' }),
    draftOrder: integer('draft_order').array().notNull().default(sql`ARRAY[]::integer[]`),
    // The cap for points earned from survivor streaks
    // 0 means no cap
    survivalCap: integer('survival_cap').notNull().default(DEFAULT_SURVIVAL_CAP),
  }
);
export type LeagueSettings = typeof leagueSettings.$inferSelect;

export const leagueInvite = createTable(
  'league_invite',
  {
    id: varchar('invite_id', { length: 16 }).notNull().primaryKey().default(nanoid()),
    league: integer('league_id').references(() => leagues.id, { onDelete: 'cascade' }).notNull(),
    expiration: timestamp('expiration', { mode: 'string' }).notNull(),
  }
);
