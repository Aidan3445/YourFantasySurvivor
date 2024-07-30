import { createTable } from './createTable';
import { castaways } from './castaways';
import { tribes } from './tribes';
import { episodes } from './episodes';
import { leagues, reference } from './leagues';
import { leagueMembers } from './members';
import { integer, pgEnum, primaryKey, serial, varchar } from 'drizzle-orm/pg-core';

export const weeklyEventType = pgEnum('event_weekly_type', ['vote', 'predict']);

export const weeklyEventRules = createTable(
  'event_weekly_rule',
  {
    id: serial('event_weekly_rule_id').notNull().primaryKey(),
    league: integer('league_id').references(() => leagues.id).notNull(),
    name: varchar('name', { length: 32 }).notNull(),
    description: varchar('description', { length: 256 }).notNull(),
    points: integer('points').notNull(),
    type: weeklyEventType('type').notNull(),
    referenceType: reference('reference_type').notNull(),
    selectionCount: integer('selection_count').notNull().default(1),
  }
);
export type WeeklyEventRule = typeof weeklyEventRules.$inferSelect;

export const weeklyEvents = createTable(
  'event_weekly',
  {
    id: serial('event_weekly_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => weeklyEventRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodes.id, { onDelete: 'cascade' }).notNull(),
    member: integer('member_id').references(() => leagueMembers.id, { onDelete: 'cascade' }).notNull(),
  }
);
export type WeeklyEvent = typeof weeklyEvents.$inferSelect;

export const weeklyEventsCastaways = createTable(
  'event_weekly_castaway',
  {
    event: integer('event_id').references(() => weeklyEvents.id, { onDelete: 'cascade' }).notNull(),
    castaway: integer('castaway_id').references(() => castaways.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.event, table.castaway] }),
  })
);

export const weeklyEventsTribes = createTable(
  'event_weekly_tribe',
  {
    event: integer('event_id').references(() => weeklyEvents.id, { onDelete: 'cascade' }).notNull(),
    tribe: integer('tribe_id').references(() => tribes.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.event, table.tribe] }),
  })
);

export const weeklyEventsMembers = createTable(
  'event_weekly_member',
  {
    event: integer('event_id').references(() => weeklyEvents.id, { onDelete: 'cascade' }).notNull(),
    member: integer('member_id').references(() => leagueMembers.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.event, table.member] }),
  })
);
