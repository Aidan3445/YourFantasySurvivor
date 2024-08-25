import { createTable } from './createTable';
import { castaways } from './castaways';
import { tribes } from './tribes';
import { episodes } from './episodes';
import { leagues, pointRange, reference } from './leagues';
import { leagueMembers } from './members';
import { integer, pgEnum, primaryKey, serial, varchar } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const weeklyEventType = pgEnum('event_weekly_type', ['vote', 'predict']);

export const weeklyEventRules = createTable(
  'event_weekly_rule',
  {
    id: serial('event_weekly_rule_id').notNull().primaryKey(),
    league: integer('league_id').references(() => leagues.id).notNull(),
    name: varchar('name', { length: 32 }).notNull(),
    // weekly events either exist on their own
    // or are tied to an admin or base event
    //adminEvent: integer('admin_event_id').references(() => adminEventRules.id),
    //baseEvent: integer('base_event_id').references(() => baseEventRules.id),
    description: varchar('description', { length: 256 }).notNull(),
    points: integer('points').notNull(),
    type: weeklyEventType('type').notNull(),
    referenceType: reference('reference_type').notNull(),
  }
);

export const WeeklyEventRule = z.object({
  name: z.string(),
  //customEvent: z.number().nullable(),
  //baseEvent: z.number().nullable(),
  description: z.string(),
  points: pointRange,
  referenceType: z.enum(reference.enumValues),
  type: z.enum(weeklyEventType.enumValues),
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
