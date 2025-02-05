import 'server-only';
import { createTable } from './createTable';
import { integer } from 'drizzle-orm/pg-core';
import { leaguesSchema } from './leagues';

export const baseEventRulesSchema = createTable(
  'event_base_rule',
  {
    leagueId: integer('league_id')
      .references(() => leaguesSchema.leagueId, { onDelete: 'cascade' })
      .primaryKey(),
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


