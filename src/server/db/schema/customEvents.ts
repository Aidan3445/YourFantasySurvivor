import { createTable } from './createTable';
import { castaways } from './castaways';
import { tribes } from './tribes';
import { episodes } from './episodes';
import { leagues, reference, pointRange } from './leagues';
import { leagueMembers } from './members';
import { integer, primaryKey, serial, varchar } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const customEventRules = createTable(
  'event_custom_rule',
  {
    id: serial('custom_rule_id').notNull().primaryKey(),
    league: integer('league_id').references(() => leagues.id, { onDelete: 'cascade' }).notNull(),
    name: varchar('name', { length: 32 }).notNull(),
    description: varchar('description', { length: 256 }).notNull(),
    points: integer('points').notNull(),
    referenceType: reference('reference_type').notNull(),
  }
);

export const eventName = z.coerce.string()
  .min(3, { message: 'Name must be between 3 and 16 characters' })
  .max(32, { message: 'Name must be between 3 and 16 characters' });

export const description = z.coerce.string()
  .min(3, { message: 'Description must be between 3 and 256 characters, or blank' })
  .max(256, { message: 'Description must be between 3 and 256 characters, or blank' })
  .or(z.literal(''));


export const CustomEventRule = z.object({
  // id used for updating and deleting
  id: z.number().optional(),
  name: eventName,
  description: description,
  points: pointRange,
  referenceType: z.enum(reference.enumValues),
});

export type CustomEventRuleType = z.infer<typeof CustomEventRule>;

export const customEvents = createTable(
  'event_custom',
  {
    id: serial('event_custom_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => customEventRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodes.id, { onDelete: 'cascade' }).notNull(),
  }
);
export type CustomEvent = typeof customEvents.$inferSelect;

export const customEventCastaways = createTable(
  'event_custom_castaway',
  {
    event: integer('event_id').references(() => customEvents.id, { onDelete: 'cascade' }).notNull(),
    castaway: integer('castaway_id').references(() => castaways.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.event, table.castaway] }),
  })
);

export const customEventTribes = createTable(
  'event_custom_tribe',
  {
    event: integer('event_id').references(() => customEvents.id, { onDelete: 'cascade' }).notNull(),
    tribe: integer('tribe_id').references(() => tribes.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.event, table.tribe] }),
  })
);

export const customEventMembers = createTable(
  'event_custom_member',
  {
    event: integer('event_id').references(() => customEvents.id, { onDelete: 'cascade' }).notNull(),
    member: integer('member_id').references(() => leagueMembers.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.event, table.member] }),
  })
);

