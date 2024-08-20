import { createTable } from './createTable';
import { castaways } from './castaways';
import { tribes } from './tribes';
import { episodes } from './episodes';
import { baseEventRules, leagues, pointRange, reference } from './leagues';
import { leagueMembers } from './members';
import { integer, pgEnum, primaryKey, serial, varchar } from 'drizzle-orm/pg-core';
import { adminEventRules } from './adminEvents';
import { z } from 'zod';

export const predictionTypes = pgEnum('event_prediction_type', ['preseason', 'merge']);

export const predictionRules = createTable(
  'event_prediction_rule',
  {
    id: serial('prediction_rule_id').notNull().primaryKey(),
    league: integer('league_id').references(() => leagues.id, { onDelete: 'cascade' }).notNull(),
    name: varchar('name', { length: 32 }).notNull(),
    // weekly events either exist on their own
    // or are tied to an admin or base event
    adminEvent: integer('admin_event_id').references(() => adminEventRules.id),
    baseEvent: integer('base_event_id').references(() => baseEventRules.id),
    description: varchar('description', { length: 256 }),
    points: integer('points').notNull(),
    referenceType: reference('reference_type'),
    selectionCount: integer('selection_count').notNull().default(1),
  }
);

export const PredictionEventRule = z.object({
  name: z.string().nullable(),
  adminEvent: z.number().nullable(),
  baseEvent: z.number().nullable(),
  description: z.string().nullable(),
  points: pointRange,
  referenceType: z.enum(reference.enumValues).nullable(),
  selectionCount: z.number(),
}).refine((rule) => {
  const refAdmin = rule.adminEvent !== null;
  const refBase = rule.baseEvent !== null;
  const newRule = rule.name !== null && rule.description !== null && rule.referenceType !== null;

  // rule must be tied to an admin event, base event, or be a new rule
  // it should not reference both an admin and base event or
  // be a new rule with a reference of either type
  return (refAdmin && !refBase && !newRule)
    || (!refAdmin && refBase && !newRule)
    || (!refAdmin && !refBase && newRule);
});

export type PredictionEventRuleType = z.infer<typeof PredictionEventRule>;

export const predictions = createTable(
  'event_prediction',
  {
    id: serial('event_prediction_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => predictionRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodes.id, { onDelete: 'cascade' }).notNull(),
    member: integer('member_id').references(() => leagueMembers.id, { onDelete: 'cascade' }).notNull(),
  }
);

export const predictionCastaways = createTable(
  'event_prediction_castaway',
  {
    prediction: integer('prediction_id').references(() => predictions.id, { onDelete: 'cascade' }).notNull(),
    castaway: integer('castaway_id').references(() => castaways.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.prediction, table.castaway] }),
  })
);

export const predictionTribes = createTable(
  'event_prediction_tribe',
  {
    prediction: integer('prediction_id').references(() => predictions.id, { onDelete: 'cascade' }).notNull(),
    tribe: integer('tribe_id').references(() => tribes.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.prediction, table.tribe] }),
  })
);

export const predictionMembers = createTable(
  'event_prediction_member',
  {
    prediction: integer('prediction_id').references(() => predictions.id, { onDelete: 'cascade' }).notNull(),
    member: integer('member_id').references(() => leagueMembers.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.prediction, table.member] }),
  })
);
