import { createTable } from './createTable';
import { castaways } from './castaways';
import { tribes } from './tribes';
import { episodes } from './episodes';
import { leagues, pointRange, reference } from './leagues';
import { leagueMembers } from './members';
import { integer, pgEnum, serial, unique, varchar } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { description, eventName } from './customEvents';

export const weeklyEventType = pgEnum('event_weekly_type', ['vote', 'predict']);
export const weeklyEventTiming = pgEnum('event_weekly_timing', ['fullSeason', 'preMerge', 'postMerge']);

export const weeklyEventRules = createTable(
  'event_weekly_rule',
  {
    id: serial('weekly_rule_id').notNull().primaryKey(),
    league: integer('league_id').references(() => leagues.id, { onDelete: 'cascade' }).notNull(),
    name: varchar('name', { length: 32 }).notNull(),
    // weekly events either exist on their own
    // or are tied to an admin or base event
    //adminEvent: integer('admin_event_id').references(() => adminEventRules.id),
    //baseEvent: integer('base_event_id').references(() => baseEventRules.id),
    description: varchar('description', { length: 256 }).notNull(),
    points: integer('points').notNull(),
    type: weeklyEventType('type').notNull(),
    timing: weeklyEventTiming('timing').default('fullSeason').notNull(),
    referenceType: reference('reference_type').notNull(),
  }
);

export const WeeklyEventRule = z.object({
  id: z.number(),
  name: eventName,
  //customEvent: z.number().nullable(),
  //baseEvent: z.number().nullable(),
  description: description,
  points: pointRange,
  referenceType: z.enum(reference.enumValues),
  type: z.enum(weeklyEventType.enumValues),
  timing: z.enum(weeklyEventTiming.enumValues),
});/*.refine((rule) => {
  const refAdmin = rule.customEvent !== null;
  const refBase = rule.baseEvent !== null;
  const newRule = rule.description !== null && rule.referenceType !== null;

  // rule must be tied to an admin event, base event, or be a new rule
  // it should not reference both an admin and base event or
  // be a new rule with a reference of either type
  return (refAdmin && !refBase && !newRule)
    || (!refAdmin && refBase && !newRule)
    || (!refAdmin && !refBase && newRule);
});*/

export type WeeklyEventRuleType = z.infer<typeof WeeklyEventRule>;

export const weeklyEvents = createTable(
  'event_weekly',
  {
    id: serial('event_weekly_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => weeklyEventRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodes.id, { onDelete: 'cascade' }).notNull(),
    member: integer('member_id').references(() => leagueMembers.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    unique: unique().on(table.rule, table.episode, table.member),
  })
);
export type WeeklyEvent = typeof weeklyEvents.$inferSelect;

export const weeklyCastaways = createTable(
  'event_weekly_castaway',
  {
    id: serial('event_weekly_castaway_id').notNull().primaryKey(),
    event: integer('event_id').references(() => weeklyEvents.id, { onDelete: 'cascade' }).notNull(),
    reference: integer('castaway_id').references(() => castaways.id, { onDelete: 'cascade' }).notNull(),
  }
);

export const weeklyTribes = createTable(
  'event_weekly_tribe',
  {
    id: serial('event_weekly_tribe_id').notNull().primaryKey(),
    event: integer('event_id').references(() => weeklyEvents.id, { onDelete: 'cascade' }).notNull(),
    reference: integer('tribe_id').references(() => tribes.id, { onDelete: 'cascade' }).notNull(),
  }
);

export const weeklyMembers = createTable(
  'event_weekly_member',
  {
    id: serial('event_weekly_member_id').notNull().primaryKey(),
    event: integer('event_id').references(() => weeklyEvents.id, { onDelete: 'cascade' }).notNull(),
    reference: integer('member_id').references(() => leagueMembers.id, { onDelete: 'cascade' }).notNull(),
  }
);

export const weeklyCastawayResults = createTable(
  'event_weekly_result_castaway',
  {
    id: serial('event_weekly_result_castaway_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => weeklyEventRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodes.id, { onDelete: 'cascade' }).notNull(),
    result: integer('result').references(() => castaways.id, { onDelete: 'cascade' }).notNull(),
  }
);

export const weeklyTribeResults = createTable(
  'event_weekly_result_tribe',
  {
    id: serial('event_weekly_result_tribe_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => weeklyEventRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodes.id, { onDelete: 'cascade' }).notNull(),
    result: integer('result').references(() => tribes.id, { onDelete: 'cascade' }).notNull(),
  }
);

export const weeklyMemberResults = createTable(
  'event_weekly_result_member',
  {
    id: serial('event_weekly_result_member_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => weeklyEventRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodes.id, { onDelete: 'cascade' }).notNull(),
    result: integer('result').references(() => leagueMembers.id, { onDelete: 'cascade' }).notNull(),
  }
);
