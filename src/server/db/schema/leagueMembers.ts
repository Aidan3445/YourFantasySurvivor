import 'server-only';

import { createTable } from '~/server/db/schema/createTable';
import { leagueSchema } from '~/server/db/schema/leagues';
import { episodeSchema } from '~/server/db/schema/episodes';
import { castawaySchema } from '~/server/db/schema/castaways';
import { boolean, check, index, integer, pgEnum, primaryKey, serial, smallint, unique, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { DISPLAY_NAME_MAX_LENGTH, LeagueMemberRoles } from '~/lib/leagues';
import { sql } from 'drizzle-orm';

export const leagueMemberRole = pgEnum('league_member_role', LeagueMemberRoles);

export const leagueMemberSchema = createTable(
  'league_member',
  {
    memberId: serial('league_member_id').notNull().primaryKey(),
    leagueId: integer('league_id').references(() => leagueSchema.leagueId, { onDelete: 'cascade' }).notNull(),
    userId: varchar('user_id', { length: 64 }).notNull(),
    displayName: varchar('display_name', { length: DISPLAY_NAME_MAX_LENGTH }).notNull(),
    color: varchar('color', { length: 7 }).notNull(),
    role: leagueMemberRole('role').notNull().default('Member'),
    draftOrder: smallint('draft_order')
  },
  (table) => [
    uniqueIndex('member_league_user_unq_idx').on(table.leagueId, table.userId),
    unique('member_league_name_unq').on(table.leagueId, table.displayName),
    unique('member_league_color_unq').on(table.leagueId, table.color),
    unique('member_league_order_unq').on(table.leagueId, table.draftOrder),
    check('member_pending_check', sql`${table.draftOrder} = NULL OR ${table.role} = 'Member'`),
  ]
);

export const selectionUpdateSchema = createTable(
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
    index('selection_member_idx').on(table.memberId),
  ]
);

export const secondaryPickSchema = createTable(
  'secondary_pick',
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
  },
  (table) => [
    primaryKey({ columns: [table.memberId, table.episodeId] }),
    index('secondary_pick_member_idx').on(table.memberId),
    index('secondary_pick_episode_idx').on(table.episodeId),
  ]
);

export const shotInTheDarkSchema = createTable(
  'shot_in_the_dark',
  {
    memberId: integer('member_id')
      .references(() => leagueMemberSchema.memberId, { onDelete: 'cascade' })
      .notNull(),
    episodeId: integer('episode_id')
      .references(() => episodeSchema.episodeId, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.memberId, table.episodeId] }),
    index('shot_in_the_dark_member_idx').on(table.memberId),
    index('shot_in_the_dark_episode_idx').on(table.episodeId),
  ]
);
