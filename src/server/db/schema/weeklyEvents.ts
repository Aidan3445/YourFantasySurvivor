import { createTable } from './createTable';
import { castawaysSchema } from './castaways';
import { tribesSchema } from './tribes';
import { episodesSchema } from './episodes';
import { leaguesSchema } from './leagues';
import { leagueMembersSchema } from './leagueMembers';
import { integer, pgEnum, serial, unique, varchar } from 'drizzle-orm/pg-core';
import { oldRef } from './customEvents';

export const weeklyEventType = pgEnum('event_weekly_type', ['vote', 'predict']);
export type WeeklyEventType = (typeof weeklyEventType.enumValues)[number];
export const weeklyEventTiming = pgEnum('event_weekly_timing', ['fullSeason', 'preMerge', 'postMerge']);
export type WeeklyEventTiming = (typeof weeklyEventTiming.enumValues)[number];

export const weeklyEventRules = createTable(
  'event_weekly_rule',
  {
    id: serial('weekly_rule_id').notNull().primaryKey(),
    league: integer('league_id').references(() => leaguesSchema.leagueId, { onDelete: 'cascade' }).notNull(),
    eventName: varchar('name', { length: 32 }).notNull(),
    // weekly events either exist on their own
    // or are tied to an admin or base event
    //adminEvent: integer('admin_event_id').references(() => adminEventRules.id),
    //baseEvent: integer('base_event_id').references(() => baseEventRules.id),
    description: varchar('description', { length: 256 }).notNull(),
    points: integer('points').notNull(),
    type: weeklyEventType('type').notNull(),
    timing: weeklyEventTiming('timing').default('fullSeason').notNull(),
    referenceType: oldRef('reference_type').notNull(),
  }
);

export const weeklyEvents = createTable(
  'event_weekly',
  {
    id: serial('event_weekly_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => weeklyEventRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodesSchema.episodeId, { onDelete: 'cascade' }).notNull(),
    member: integer('member_id').references(() => leagueMembersSchema.memberId, { onDelete: 'cascade' }).notNull(),
  },
  (table) => [
    unique().on(table.rule, table.episode, table.member),
  ]
);
export type WeeklyEvent = typeof weeklyEvents.$inferSelect;

export const weeklyCastaways = createTable(
  'event_weekly_castaway',
  {
    id: serial('event_weekly_castaway_id').notNull().primaryKey(),
    event: integer('event_id').references(() => weeklyEvents.id, { onDelete: 'cascade' }).notNull().unique(),
    reference: integer('castaway_id').references(() => castawaysSchema.castawayId, { onDelete: 'cascade' }).notNull(),
  },
);

export const weeklyTribes = createTable(
  'event_weekly_tribe',
  {
    id: serial('event_weekly_tribe_id').notNull().primaryKey(),
    event: integer('event_id').references(() => weeklyEvents.id, { onDelete: 'cascade' }).notNull().unique(),
    reference: integer('tribe_id').references(() => tribesSchema.tribeId, { onDelete: 'cascade' }).notNull(),
  }
);

export const weeklyMembers = createTable(
  'event_weekly_member',
  {
    id: serial('event_weekly_member_id').notNull().primaryKey(),
    event: integer('event_id').references(() => weeklyEvents.id, { onDelete: 'cascade' }).notNull(),
    reference: integer('member_id').references(() => leagueMembersSchema.memberId, { onDelete: 'cascade' }).notNull().unique(),
  }
);

export const weeklyCastawayResults = createTable(
  'event_weekly_result_castaway',
  {
    id: serial('event_weekly_result_castaway_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => weeklyEventRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodesSchema.episodeId, { onDelete: 'cascade' }).notNull(),
    result: integer('result').references(() => castawaysSchema.castawayId, { onDelete: 'cascade' }).notNull(),
  }
);

export const weeklyTribeResults = createTable(
  'event_weekly_result_tribe',
  {
    id: serial('event_weekly_result_tribe_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => weeklyEventRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodesSchema.episodeId, { onDelete: 'cascade' }).notNull(),
    result: integer('result').references(() => tribesSchema.tribeId, { onDelete: 'cascade' }).notNull(),
  }
);

export const weeklyMemberResults = createTable(
  'event_weekly_result_member',
  {
    id: serial('event_weekly_result_member_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => weeklyEventRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodesSchema.episodeId, { onDelete: 'cascade' }).notNull(),
    result: integer('result').references(() => leagueMembersSchema.memberId, { onDelete: 'cascade' }).notNull(),
  }
);
