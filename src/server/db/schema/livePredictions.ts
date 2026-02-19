import 'server-only';

import { createTable } from '~/server/db/schema/createTable';
import { boolean, index, integer, pgEnum, serial, timestamp, unique, varchar } from 'drizzle-orm/pg-core';
import { episodeSchema } from '~/server/db/schema/episodes';
import { seasonSchema } from '~/server/db/schema/seasons';
import { reference } from '~/server/db/schema/shared';
import { LivePredictionStatuses } from '~/lib/events';

export const livePredictionStatusEnum = pgEnum('live_prediction_status', LivePredictionStatuses);

// The question sent out during an episode
export const livePredictionSchema = createTable(
  'live_prediction',
  {
    livePredictionId: serial('live_prediction_id').notNull().primaryKey(),
    seasonId: integer('season_id').references(() => seasonSchema.seasonId, { onDelete: 'cascade' }).notNull(),
    episodeId: integer('episode_id').references(() => episodeSchema.episodeId, { onDelete: 'cascade' }).notNull(),
    title: varchar('title', { length: 64 }).notNull(),
    description: varchar('description', { length: 256 }),
    status: livePredictionStatusEnum('status').notNull().default('Open'),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    paused: boolean('paused').notNull().default(false),
  },
  (table) => [
    index('live_pred_episode_idx').on(table.episodeId),
    index('live_pred_season_idx').on(table.seasonId),
    index('live_pred_status_idx').on(table.status),
  ]
);

// An answer option — can be a castaway, tribe, or free-text
export const livePredictionOptionSchema = createTable(
  'live_prediction_option',
  {
    livePredictionOptionId: serial('live_prediction_option_id').notNull().primaryKey(),
    livePredictionId: integer('live_prediction_id')
      .references(() => livePredictionSchema.livePredictionId, { onDelete: 'cascade' }).notNull(),
    label: varchar('label', { length: 128 }).notNull(),
    referenceType: reference('reference_type'),
    referenceId: integer('reference_id'),
    isCorrect: boolean('is_correct')
  },
  (table) => [
    index('live_opt_prediction_idx').on(table.livePredictionId),
  ]
);

// A user's response — picks one option
export const livePredictionResponseSchema = createTable(
  'live_prediction_response',
  {
    livePredictionResponseId: serial('live_prediction_response_id').notNull().primaryKey(),
    livePredictionId: integer('live_prediction_id')
      .references(() => livePredictionSchema.livePredictionId, { onDelete: 'cascade' }).notNull(),
    optionId: integer('option_id')
      .references(() => livePredictionOptionSchema.livePredictionOptionId, { onDelete: 'cascade' }).notNull(),
    userId: varchar('user_id', { length: 64 }).notNull(),
  },
  (table) => [
    index('live_resp_prediction_idx').on(table.livePredictionId),
    index('live_resp_user_idx').on(table.userId),
    unique('live_resp_prediction_user_unq').on(table.livePredictionId, table.userId),
  ]
);

// Live leaderboard username
export const livePredictionLeaderboardUsernameSchema = createTable(
  'live_prediction_leaderboard_username',
  {
    userId: varchar('user_id', { length: 64 }).notNull().primaryKey(),
    username: varchar('username', { length: 64 }).notNull(),
  }
);
