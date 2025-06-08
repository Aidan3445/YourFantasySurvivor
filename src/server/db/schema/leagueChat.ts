import 'server-only';

import { createTable } from './createTable';
import { leaguesSchema } from './leagues';
import { index, integer, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { leagueMembersSchema } from './leagueMembers';

export const leagueChatSchema = createTable(
  'league_chat',
  {
    messageId: serial('message_id').primaryKey(),
    serial: varchar('serial', { length: 64 }).notNull(),
    leagueHash: varchar('league_hash', { length: 16 }).notNull().references(() => leaguesSchema.leagueHash, { onDelete: 'cascade' }),
    sentById: integer('sent_by_id').notNull().references(() => leagueMembersSchema.memberId, { onDelete: 'cascade' }),
    text: varchar('text', { length: 1000 }).notNull(),
    timestamp: timestamp('timestamp', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    index('league_idx').on(table.leagueHash),
  ]
);
