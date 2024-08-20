import { createTable } from './createTable';
import { castaways } from './castaways';
import { tribes } from './tribes';
import { episodes } from './episodes';
import { leagues, reference, pointRange } from './leagues';
import { leagueMembers } from './members';
import { integer, primaryKey, serial, varchar } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const adminEventRules = createTable(
  'event_admin_rule',
  {
    id: serial('admin_rule_id').notNull().primaryKey(),
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
  .min(3, { message: 'Description must be between 3 and 256 characters' })
  .max(256, { message: 'Description must be between 3 and 256 characters' });

export const AdminEventRule = z.object({
  name: eventName,
  description: z.string(),
  points: pointRange,
  referenceType: z.enum(reference.enumValues),
});

export type AdminEventRuleType = z.infer<typeof AdminEventRule>;

export const adminEvents = createTable(
  'event_admin',
  {
    id: serial('event_admin_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => adminEventRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodes.id, { onDelete: 'cascade' }).notNull(),
  }
);
export type AdminEvent = typeof adminEvents.$inferSelect;

export const adminEventCastaways = createTable(
  'event_admin_castaway',
  {
    event: integer('event_id').references(() => adminEvents.id, { onDelete: 'cascade' }).notNull(),
    castaway: integer('castaway_id').references(() => castaways.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.event, table.castaway] }),
  })
);

export const adminEventTribes = createTable(
  'event_admin_tribe',
  {
    event: integer('event_id').references(() => adminEvents.id, { onDelete: 'cascade' }).notNull(),
    tribe: integer('tribe_id').references(() => tribes.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.event, table.tribe] }),
  })
);

export const adminEventMembers = createTable(
  'event_admin_member',
  {
    event: integer('event_id').references(() => adminEvents.id, { onDelete: 'cascade' }).notNull(),
    member: integer('member_id').references(() => leagueMembers.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.event, table.member] }),
  })
);

