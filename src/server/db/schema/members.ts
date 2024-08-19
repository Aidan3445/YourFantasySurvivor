import { createTable } from './createTable';
import { leagues } from './leagues';
import { episodes } from './episodes';
import { castaways } from './castaways';
import { integer, serial, varchar, boolean, unique, timestamp } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const leagueMembers = createTable(
  'league_member',
  {
    id: serial('league_member_id').notNull().primaryKey(),
    league: integer('league_id').references(() => leagues.id, { onDelete: 'cascade' }).notNull(),
    userId: varchar('user_id', { length: 64 }).notNull(),
    color: varchar('color', { length: 7 }).notNull(),
    displayName: varchar('display_name', { length: 16 }).notNull(),
    isOwner: boolean('is_owner').notNull().default(false),
    isAdmin: boolean('is_admin').notNull().default(false),
  },
  (table) => ({
    singleJoin: unique().on(table.league, table.userId),
    uniqueDisplayName: unique().on(table.league, table.displayName),
    uniqueColor: unique().on(table.league, table.color),
  })
);
export type LeagueMember = typeof leagueMembers.$inferSelect;

export const selectionUpdates = createTable(
  'selection_update',
  {
    id: serial('selection_update_id').notNull().primaryKey(),
    member: integer('member_id').references(() => leagueMembers.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodes.id, { onDelete: 'cascade' }).notNull(),
    castaway: integer('castaway_id').references(() => castaways.id, { onDelete: 'cascade' }).notNull(),
  }
);
export type SelectionUpdate = typeof selectionUpdates.$inferSelect;

export const leagueInvite = createTable(
  'league_invite',
  {
    id: varchar('invite_id', { length: 16 }).notNull().primaryKey().default(nanoid()),
    league: integer('league_id').references(() => leagues.id, { onDelete: 'cascade' }).notNull(),
    member: integer('member_id').references(() => leagueMembers.id, { onDelete: 'cascade' }),
    expiration: timestamp('expiration', { mode: 'string' }).notNull(),
  }
);
