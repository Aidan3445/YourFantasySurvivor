import { createTable } from './createTable';
import { seasons } from './seasons';
import { boolean, customType, integer, pgEnum, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

const pickCount = customType<{ data: 1 | 2; notNull: true; default: true }>(
  {
    dataType() {
      return 'integer';
    },
  },
);

export const leagues = createTable(
  'league',
  {
    id: serial('league_id').notNull().primaryKey(),
    name: varchar('name', { length: 64 }).notNull().unique(),
    password: varchar('password', { length: 64 }).notNull(),
    season: integer('season_id').references(() => seasons.id, { onDelete: 'cascade' }).notNull(),
    locked: boolean('locked').notNull().default(false),
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
export type BaseEventRules = {
  advFound: number;
  advPlay: number;
  badAdvPlay: number;
  advElim: number;
  spokeEpTitle: number;
  tribe1st: number;
  tribe2nd: number;
  indivWin: number;
  indivReward: number;
  finalists: number;
  fireWin: number;
  soleSurvivor: number;
};
export const defaultRules: BaseEventRules = {
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

export const draftSettings = createTable(
  'league_settings',
  {
    league: integer('league_id').references(() => leagues.id, { onDelete: 'cascade' }).notNull().primaryKey(),
    inviteOnly: boolean('invite_only').notNull().default(false),
    uniquePicks: boolean('unique_picks').notNull().default(true),
    pickCount: pickCount('pick_count').notNull().default(1),
    date: timestamp('draft_date', { mode: 'string' }).notNull(),
    order: integer('draft_order').array().notNull(),
    turnLimitMins: integer('turn_limit_mins').notNull().default(10),
  }
);
export type DraftSettings = {
  uniquePicks: boolean;
  pickCount: 1 | 2;
  date: Date;
  order: number[]; // member ids
  turnLimitMins: number; // minutes before pick is skipped
};
