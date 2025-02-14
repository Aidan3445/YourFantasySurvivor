import 'server-only';
import { createTable } from './createTable';
import { seasonsSchema } from './seasons';
import { tribesSchema } from './tribes';
import { castawaysSchema } from './castaways';
import { integer, serial, varchar, smallint, timestamp, boolean, unique } from 'drizzle-orm/pg-core';
import { baseEventsSchema } from './baseEvents';

export const episodesSchema = createTable(
  'episode',
  {
    episodeId: serial('episode_id').notNull().primaryKey(),
    episodeNumber: smallint('number').notNull(),
    title: varchar('title', { length: 64 }).notNull(),
    airDate: timestamp('air_date', { mode: 'string' }).notNull(),
    runtime: smallint('runtime').default(90).notNull(),
    seasonId: integer('season_id').references(() => seasonsSchema.seasonId, { onDelete: 'cascade' }).notNull(),
    isMerge: boolean('merge').default(false).notNull(),
    isFinale: boolean('finale').default(false).notNull(),
  },
  (table) => [
    unique().on(table.seasonId, table.episodeNumber),
  ]
);

export const baseEventCastaways = createTable(
  'event_base_castaway',
  {
    baseEventReferenceId: serial('event_base_castaway_id').notNull().primaryKey(),
    eventId: integer('event_id').references(() => baseEventsSchema.baseEventId, { onDelete: 'cascade' }).notNull(),
    referenceId: integer('castaway_id').references(() => castawaysSchema.castawayId, { onDelete: 'cascade' }).notNull(),
  }
);

export const baseEventTribes = createTable(
  'event_base_tribe',
  {
    baseEventReferenceId: serial('event_base_tribe_id').notNull().primaryKey(),
    eventId: integer('event_id').references(() => baseEventsSchema.baseEventId, { onDelete: 'cascade' }).notNull(),
    referenceId: integer('tribe_id').references(() => tribesSchema.tribeId, { onDelete: 'cascade' }).notNull(),
  }
);


