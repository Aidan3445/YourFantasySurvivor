import 'server-only';

import { createTable } from './createTable';
import { leaguesSchema } from './leagues';
import { episodesSchema } from './episodes';
import { castawaysSchema } from './castaways';
import { boolean, index, integer, pgEnum, primaryKey, serial, unique, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { DISPLAY_NAME_MAX_LENGTH, LeagueMemberRoleOptions } from '~/server/db/defs/leagueMembers';

export const leagueMemberRole = pgEnum('league_member_role', LeagueMemberRoleOptions);

export const leagueMembersSchema = createTable(
  'league_member',
  {
    memberId: serial('league_member_id').notNull().primaryKey(),
    leagueId: integer('league_id').references(() => leaguesSchema.leagueId, { onDelete: 'cascade' }).notNull(),
    userId: varchar('user_id', { length: 64 }).notNull(),
    color: varchar('color', { length: 7 }).notNull(),
    displayName: varchar('display_name', { length: DISPLAY_NAME_MAX_LENGTH }).notNull(),
    role: leagueMemberRole('role').notNull().default('Member'),
  },
  (table) => [
    uniqueIndex('league_user_idx').on(table.leagueId, table.userId),
    unique('league_displayName_unq').on(table.leagueId, table.displayName),
    unique('league_color_unq').on(table.leagueId, table.color),
  ]
);

export const selectionUpdatesSchema = createTable(
  'selection_update',
  {
    memberId: integer('member_id')
      .references(() => leagueMembersSchema.memberId, { onDelete: 'cascade' })
      .notNull(),
    episodeId: integer('episode_id')
      .references(() => episodesSchema.episodeId, { onDelete: 'cascade' })
      .notNull(),
    castawayId: integer('castaway_id')
      .references(() => castawaysSchema.castawayId, { onDelete: 'cascade' })
      .notNull(),
    draft: boolean('draft').notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.memberId, table.episodeId] }),
    index('member_idx').on(table.memberId),
  ]
);
export type SelectionUpdate = typeof selectionUpdatesSchema.$inferSelect;

