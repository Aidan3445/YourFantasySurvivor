import { createTable } from './createTable';
import { castaways } from './castaways';
import { tribes } from './tribes';
import { episodesSchema } from './episodes';
import { leaguesSchema } from './leagues';
import { leagueMembersSchema } from './leagueMembers';
import { integer, pgEnum, serial, varchar } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const oldRef = pgEnum('event_old_reference', ['castaway', 'tribe', 'member']);

export const customEventRules = createTable(
  'event_custom_rule',
  {
    id: serial('custom_rule_id').notNull().primaryKey(),
    league: integer('league_id').references(() => leaguesSchema.leagueId, { onDelete: 'cascade' }).notNull(),
    eventName: varchar('name', { length: 32 }).notNull(),
    description: varchar('description', { length: 256 }).notNull(),
    points: integer('points').notNull(),
    referenceType: oldRef('reference_type').notNull(),
  }
);

export const eventName = z.coerce.string()
  .min(3, { message: 'Name must be between 3 and 16 characters' })
  .max(32, { message: 'Name must be between 3 and 16 characters' });

export const description = z.coerce.string()
  .min(3, { message: 'Description must be between 3 and 256 characters, or blank' })
  .max(256, { message: 'Description must be between 3 and 256 characters, or blank' })
  .or(z.literal(''));

export const customEvents = createTable(
  'event_custom',
  {
    id: serial('event_custom_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => customEventRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodesSchema.episodeId, { onDelete: 'cascade' }).notNull(),
  }
);
export type CustomEvent = typeof customEvents.$inferSelect;

export const customCastaways = createTable(
  'event_custom_castaway',
  {
    id: serial('event_custom_castaway_id').notNull().primaryKey(),
    event: integer('event_id').references(() => customEvents.id, { onDelete: 'cascade' }).notNull(),
    reference: integer('castaway_id').references(() => castaways.castawayId, { onDelete: 'cascade' }).notNull(),
  },
);

export const customTribes = createTable(
  'event_custom_tribe',
  {
    id: serial('event_custom_tribe_id').notNull().primaryKey(),
    event: integer('event_id').references(() => customEvents.id, { onDelete: 'cascade' }).notNull(),
    reference: integer('tribe_id').references(() => tribes.tribeId, { onDelete: 'cascade' }).notNull(),
  },
);

export const customMembers = createTable(
  'event_custom_member',
  {
    id: serial('event_custom_member_id').notNull().primaryKey(),
    event: integer('event_id').references(() => customEvents.id, { onDelete: 'cascade' }).notNull(),
    reference: integer('member_id').references(() => leagueMembersSchema.memberId, { onDelete: 'cascade' }).notNull(),
  },
);

