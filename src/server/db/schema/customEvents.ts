import 'server-only';
import { index, integer, pgEnum, serial, unique, varchar } from 'drizzle-orm/pg-core';

import { createTable } from '~/server/db/schema/createTable';
import { leagueSchema } from '~/server/db/schema/leagues';
import { label, notes, reference, timing } from '~/server/db/schema/shared';
import { EventTypes } from '~/lib/events';
import { episodeSchema } from '~/server/db/schema/episodes';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';


export const eventType = pgEnum('event_type', EventTypes);
export const customEventRuleSchema = createTable(
  'event_custom_rule',
  {
    customEventRuleId: serial('custom_event_rule_id').notNull().primaryKey(),
    leagueId: integer('league_id').notNull().references(() => leagueSchema.leagueId, { onDelete: 'cascade' }),
    eventName: varchar('event_name', { length: 64 }).notNull(),
    description: varchar('event_desc', { length: 256 }).notNull(),
    points: integer('event_points').notNull(),
    eventType: eventType('event_type').notNull(),
    referenceTypes: reference('reference_types').array().notNull(),
    timing: timing('event_timing').array().notNull(),
  },
  (table) => [
    unique().on(table.leagueId, table.eventName),
    index().on(table.leagueId),
  ]
);

export const customEventSchema = createTable(
  'event_custom',
  {
    customEventId: serial('custom_event_id').notNull().primaryKey(),
    episodeId: integer('episode_id').notNull().references(() => leagueSchema.leagueId, { onDelete: 'cascade' }),
    customEventRuleId: integer('custom_event_rule_id').notNull().references(() => customEventRuleSchema.customEventRuleId, { onDelete: 'cascade' }),
    label: label('label'),
    notes: notes('notes'),
  },
  (table) => [
    index().on(table.episodeId),
    index().on(table.customEventRuleId),
  ]
);

export const customEventReferenceSchema = createTable(
  'event_custom_reference',
  {
    customEventReferenceId: serial('custom_event_reference_id').notNull().primaryKey(),
    customEventId: integer('custom_event_id').notNull().references(() => customEventSchema.customEventId, { onDelete: 'cascade' }),
    referenceType: reference('reference_type').notNull(),
    referenceId: integer('reference_id').notNull(),
  },
  (table) => [
    index().on(table.customEventId),
    index().on(table.referenceId, table.referenceType),
    unique().on(table.customEventId, table.referenceType, table.referenceId)
  ]
);

export const customEventPredictionSchema = createTable(
  'event_custom_prediction',
  {
    customEventPredictionId: serial('custom_event_prediction_id').notNull().primaryKey(),
    customEventRuleId: integer('custom_event_rule_id').notNull().references(() => customEventRuleSchema.customEventRuleId, { onDelete: 'cascade' }),
    episodeId: integer('episode_id').notNull().references(() => episodeSchema.episodeId, { onDelete: 'cascade' }),
    memberId: integer('member_id').notNull().references(() => leagueMemberSchema.memberId, { onDelete: 'cascade' }),
    referenceType: reference('reference_type').notNull(),
    referenceId: integer('reference_id').notNull(),
    bet: integer('bet')
  },
  (table) => [
    index().on(table.episodeId),
    index().on(table.memberId),
    index().on(table.customEventRuleId),
    unique().on(table.customEventRuleId, table.episodeId, table.memberId)
  ]
);

