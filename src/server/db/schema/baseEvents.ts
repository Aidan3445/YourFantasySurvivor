import 'server-only';

import { createTable } from '~/server/db/schema/createTable';
import { boolean, index, integer, pgEnum, serial, unique } from 'drizzle-orm/pg-core';
import { leagueSchema } from '~/server/db/schema/leagues';
import { episodeSchema } from '~/server/db/schema/episodes';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { label, notes, reference, timing } from '~/server/db/schema/shared';
import { BaseEventNames, ScoringBaseEventNames } from '~/lib/events';
import { ShauhinModeTimings } from '~/lib/leagues';

export const eventName = pgEnum('event_name', BaseEventNames);
export const scoringEventName = pgEnum('scoring_event_name', ScoringBaseEventNames);
export const baseEventSchema = createTable(
  'event_base',
  {
    baseEventId: serial('event_base_id').notNull().primaryKey(),
    episodeId: integer('episode_id').references(() => episodeSchema.episodeId, { onDelete: 'cascade' }).notNull(),
    eventName: eventName('name').notNull(),
    label: label('label'),
    notes: notes('notes'),
  },
  (table) => [
    index().on(table.episodeId),
    index().on(table.eventName)
  ]
);

export const baseEventReferenceSchema = createTable(
  'event_base_reference',
  {
    baseEventReferenceId: serial('event_base_reference_id').notNull().primaryKey(),
    baseEventId: integer('event_id').references(() => baseEventSchema.baseEventId, { onDelete: 'cascade' }).notNull(),
    referenceType: reference('reference_type').notNull(),
    referenceId: integer('reference_id').notNull(),
  },
  (table) => [
    index().on(table.baseEventId),
    index().on(table.referenceId, table.referenceType),
    unique().on(table.baseEventId, table.referenceType, table.referenceId)
  ]
);

export const baseEventRulesSchema = createTable(
  'event_base_rule',
  {
    leagueId: integer('league_id')
      .references(() => leagueSchema.leagueId, { onDelete: 'cascade' })
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
    elim: integer('elim').notNull().default(0)
  }
);

export const baseEventPredictionRulesSchema = createTable(
  'event_base_prediction_rule',
  {
    leagueId: integer('league_id')
      .references(() => leagueSchema.leagueId, { onDelete: 'cascade' })
      .primaryKey(),
    advFoundPrediction: boolean('adv_found_prediction'),
    advFoundPredictionPoints: integer('adv_found_prediction_points'),
    advFoundPredictionTiming: timing('adv_found_prediction_timing').array(),

    advPlayPrediction: boolean('adv_play_prediction'),
    advPlayPredictionPoints: integer('adv_play_prediction_points'),
    advPlayPredictionTiming: timing('adv_play_prediction_timing').array(),

    badAdvPlayPrediction: boolean('bad_adv_play_prediction'),
    badAdvPlayPredictionPoints: integer('bad_adv_play_prediction_points'),
    badAdvPlayPredictionTiming: timing('bad_adv_play_prediction_timing').array(),

    advElimPrediction: boolean('adv_elim_prediction'),
    advElimPredictionPoints: integer('adv_elim_prediction_points'),
    advElimPredictionTiming: timing('adv_elim_prediction_timing').array(),

    spokeEpTitlePrediction: boolean('spoke_ep_title_prediction'),
    spokeEpTitlePredictionPoints: integer('spoke_ep_title_prediction_points'),
    spokeEpTitlePredictionTiming: timing('spoke_ep_title_prediction_timing').array(),

    tribe1stPrediction: boolean('tribe_1st_prediction'),
    tribe1stPredictionPoints: integer('tribe_1st_prediction_points'),
    tribe1stPredictionTiming: timing('tribe_1st_prediction_timing').array(),

    tribe2ndPrediction: boolean('tribe_2nd_prediction'),
    tribe2ndPredictionPoints: integer('tribe_2nd_prediction_points'),
    tribe2ndPredictionTiming: timing('tribe_2nd_prediction_timing').array(),

    indivWinPrediction: boolean('indiv_win_prediction'),
    indivWinPredictionPoints: integer('indiv_win_prediction_points'),
    indivWinPredictionTiming: timing('indiv_win_prediction_timing').array(),

    indivRewardPrediction: boolean('indiv_reward_prediction'),
    indivRewardPredictionPoints: integer('indiv_reward_prediction_points'),
    indivRewardPredictionTiming: timing('indiv_reward_prediction_timing').array(),

    finalistsPrediction: boolean('finalists_prediction'),
    finalistsPredictionPoints: integer('finalists_prediction_points'),
    finalistsPredictionTiming: timing('finalists_prediction_timing').array(),

    fireWinPrediction: boolean('fire_win_prediction'),
    fireWinPredictionPoints: integer('fire_win_prediction_points'),
    fireWinPredictionTiming: timing('fire_win_prediction_timing').array(),

    soleSurvivorPrediction: boolean('sole_survivor_prediction'),
    soleSurvivorPredictionPoints: integer('sole_survivor_prediction_points'),
    soleSurvivorPredictionTiming: timing('sole_survivor_prediction_timing').array(),

    elimPrediction: boolean('elim_prediction'),
    elimPredictionPoints: integer('elim_prediction_points'),
    elimPredictionTiming: timing('elim_prediction_timing').array()
  }
);

export const baseEventPredictionSchema = createTable(
  'event_base_prediction',
  {
    baseEventPredictionId: serial('event_base_prediction_id').notNull().primaryKey(),
    baseEventName: scoringEventName('event_name').notNull(),
    episodeId: integer('episode_id').notNull().references(() => episodeSchema.episodeId, { onDelete: 'cascade' }).notNull(),
    memberId: integer('member_id').notNull().references(() => leagueMemberSchema.memberId, { onDelete: 'cascade' }).notNull(),
    referenceType: reference('reference_type').notNull(),
    referenceId: integer('reference_id').notNull(),
    bet: integer('bet')
  },
  (table) => [
    index().on(table.episodeId),
    index().on(table.memberId),
    index().on(table.baseEventName),
    unique().on(table.baseEventName, table.episodeId, table.memberId)
  ]
);

export const shauhinModeStart = pgEnum('event_shauhin_mode_start', ShauhinModeTimings);
export const shauhinModeSettingsSchema = createTable(
  'event_shauhin_mode_settings',
  {
    leagueId: integer('league_id')
      .references(() => leagueSchema.leagueId, { onDelete: 'cascade' })
      .primaryKey(),
    enabled: boolean('enabled').notNull(),
    maxBet: integer('max_bet').notNull(),
    maxBetsPerWeek: integer('max_bets_per_week').notNull(),
    startWeek: shauhinModeStart('start_week'),
    customStartWeek: integer('custom_start_week'),
    enabledBets: scoringEventName('enabled_bets').array().notNull(),
    noEventIsMiss: boolean('no_event_is_miss').notNull()
  }
);
