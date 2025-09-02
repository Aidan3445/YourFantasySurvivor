import 'server-only';

import { createTable } from '~/server/db/schema/createTable';
import { leagueSchema } from '~/server/db/schema/leagues';
import { episodeSchema } from '~/server/db/schema/episodes';
import { castawaySchema } from '~/server/db/schema/castaways';
import { boolean, index, integer, pgEnum, primaryKey, serial, unique, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { DISPLAY_NAME_MAX_LENGTH, LeagueMemberRoleOptions } from '~/types/deprecated/leagueMembers';

export const leagueMemberRole = pgEnum('league_member_role', LeagueMemberRoleOptions);

export const leagueMemberSchema = createTable(
  'league_member',
  {
    memberId: serial('league_member_id').notNull().primaryKey(),
    leagueId: integer('league_id').references(() => leagueSchema.leagueId, { onDelete: 'cascade' }).notNull(),
    userId: varchar('user_id', { length: 64 }).notNull(),
    displayName: varchar('display_name', { length: DISPLAY_NAME_MAX_LENGTH }).notNull(),
    color: varchar('color', { length: 7 }).notNull(),
    role: leagueMemberRole('role').notNull().default('Member'),
    draftOrder: integer('draft_order'),
  },
  (table) => [
    uniqueIndex('league_user_idx').on(table.leagueId, table.userId),
    unique('league_displayName_unq').on(table.leagueId, table.displayName),
    unique('league_color_unq').on(table.leagueId, table.color),
    unique('league_draftOrder_unq').on(table.leagueId, table.draftOrder),
  ]
);

export const selectionUpdatesSchema = createTable(
  'selection_update',
  {
    memberId: integer('member_id')
      .references(() => leagueMemberSchema.memberId, { onDelete: 'cascade' })
      .notNull(),
    episodeId: integer('episode_id')
      .references(() => episodeSchema.episodeId, { onDelete: 'cascade' })
      .notNull(),
    castawayId: integer('castaway_id')
      .references(() => castawaySchema.castawayId, { onDelete: 'cascade' })
      .notNull(),
    draft: boolean('draft').notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.memberId, table.episodeId] }),
    index('member_idx').on(table.memberId),
  ]
);
export type SelectionUpdate = typeof selectionUpdatesSchema.$inferSelect;

