import 'server-only';

import { createTable } from './createTable';
import { index, integer, pgEnum, serial, varchar } from 'drizzle-orm/pg-core';
import { leaguesSchema } from './leagues';
import { AllBaseEventNames, ReferenceOptions } from '~/server/db/defs/events';
import { episodesSchema } from './episodes';

export const eventName = pgEnum('event_name', AllBaseEventNames);
export const baseEventsSchema = createTable(
  'event_base',
  {
    baseEventId: serial('event_base_id').notNull().primaryKey(),
    episodeId: integer('episode_id').references(() => episodesSchema.episodeId, { onDelete: 'cascade' }).notNull(),
    eventName: eventName('name').notNull(),
    keywords: varchar('keywords', { length: 32 }).array(),
    notes: varchar('notes', { length: 256 }).array()
  },
  (table) => [
    index().on(table.episodeId)
  ]
);

export const leagueEventReference = pgEnum('event_league_reference', ReferenceOptions);
export const baseEventReferenceSchema = createTable(
  'event_base_reference',
  {
    baseEventReferenceId: serial('event_base_reference_id').notNull().primaryKey(),
    baseEventId: integer('event_id').references(() => baseEventsSchema.baseEventId, { onDelete: 'cascade' }).notNull(),
    referenceType: leagueEventReference('reference_type').notNull(),
    referenceId: integer('reference_id').notNull(),
  },
  (table) => [
    index().on(table.baseEventId),
    index().on(table.referenceId),
  ]
);

export const baseEventRulesSchema = createTable(
  'event_base_rule',
  {
    leagueId: integer('league_id')
      .references(() => leaguesSchema.leagueId, { onDelete: 'cascade' })
      .primaryKey(),
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

