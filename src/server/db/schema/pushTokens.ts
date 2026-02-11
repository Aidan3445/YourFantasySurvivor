import { boolean, index, jsonb, pgEnum, serial, varchar } from 'drizzle-orm/pg-core';
import 'server-only';

import { createTable } from '~/server/db/schema/createTable';

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

