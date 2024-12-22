import { createTable } from './createTable';
import { leagues } from './leagues';
import { episodes } from './episodes';
import { castaways } from './castaways';
import { integer, serial, varchar, boolean, unique } from 'drizzle-orm/pg-core';

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
  (table) => [
    unique().on(table.league, table.userId),
    unique().on(table.league, table.displayName),
    unique().on(table.league, table.color),
  ]
);
export type LeagueMember = typeof leagueMembers.$inferSelect;
export interface Member {
  id: number;
  displayName: string;
  color: string;
  isAdmin: boolean;
  isOwner: boolean;
  loggedIn: boolean;
  picks: {
    name: string;
    elimWhilePicked: boolean;
  }[];
}

export const selectionUpdates = createTable(
  'selection_update',
  {
    member: integer('member_id').references(() => leagueMembers.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodes.id, { onDelete: 'cascade' }).notNull(),
    castaway: integer('castaway_id').references(() => castaways.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => [
    unique().on(table.member, table.episode),
  ]
);
export type SelectionUpdate = typeof selectionUpdates.$inferSelect;
export interface Selection {
  member: string;
  episode: number;
  castaway: string;
}
