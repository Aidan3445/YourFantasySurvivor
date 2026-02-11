import { boolean, index, integer, jsonb, pgEnum, primaryKey, serial, varchar } from 'drizzle-orm/pg-core';
import 'server-only';

import { createTable } from '~/server/db/schema/createTable';
import { episodeSchema } from '~/server/db/schema/episodes';

export const platform = pgEnum('platform', ['ios', 'android']);

export const pushTokens = createTable(
  'push_tokens',
  {
    tokenId: serial('token_id').notNull().primaryKey(),
    userId: varchar('user_id', { length: 64 }).notNull(),
    token: varchar('token', { length: 100 }).notNull(),
    platform: platform('platform').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    preferences: jsonb('preferences').$type<{
      reminders: boolean;
      leagueActivity: boolean;
      episodeUpdates: boolean;
      liveScoring: boolean;
    }>()
  },
  (table) => [
    index('user_token_idx').on(table.userId, table.token),
  ]
);

export const liveScoringSessionSchema = createTable(
  'live_scoring_session',
  {
    episodeId: integer('episode_id')
      .references(() => episodeSchema.episodeId, { onDelete: 'cascade' })
      .notNull(),
    userId: varchar('user_id', { length: 64 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.episodeId, table.userId] }),
    index('live_scoring_episode_idx').on(table.episodeId),
  ]
);
