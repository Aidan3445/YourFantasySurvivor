import { createTable } from './createTable';
import { seasonsSchema } from './seasons';
import { tribes } from './tribes';
import { castaways } from './castaways';
import { integer, serial, varchar, smallint, timestamp, boolean, pgEnum, unique } from 'drizzle-orm/pg-core';

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
export type Episode = typeof episodesSchema.$inferSelect;

export const eventName = pgEnum('event_name', [
  'advFound', 'advPlay', 'badAdvPlay', 'advElim', 'spokeEpTitle', 'tribe1st', 'tribe2nd',
  'indivWin', 'indivReward', 'finalists', 'fireWin', 'soleSurvivor', 'elim', 'noVoteExit',
  'tribeUpdate', 'otherNotes']);
export type EventName = (typeof eventName.enumValues)[number];

export const baseEvents = createTable(
  'event_base',
  {
    baseEventId: serial('event_base_id').notNull().primaryKey(),
    episodeId: integer('episode_id').references(() => episodesSchema.episodeId, { onDelete: 'cascade' }).notNull(),
    eventName: eventName('name').notNull(),
    keywords: varchar('keywords', { length: 32 }).array().notNull(),
    notes: varchar('notes', { length: 256 }).array().notNull(),
  }
);
export type BaseEventInsert = Omit<typeof baseEvents.$inferInsert, 'baseEventId'>;

export const baseEventCastaways = createTable(
  'event_base_castaway',
  {
    baseEventReferenceId: serial('event_base_castaway_id').notNull().primaryKey(),
    eventId: integer('event_id').references(() => baseEvents.baseEventId, { onDelete: 'cascade' }).notNull(),
    referenceId: integer('castaway_id').references(() => castaways.castawayId, { onDelete: 'cascade' }).notNull(),
  }
);

export const baseEventTribes = createTable(
  'event_base_tribe',
  {
    baseEventReferenceId: serial('event_base_tribe_id').notNull().primaryKey(),
    eventId: integer('event_id').references(() => baseEvents.baseEventId, { onDelete: 'cascade' }).notNull(),
    referenceId: integer('tribe_id').references(() => tribes.tribeId, { onDelete: 'cascade' }).notNull(),
  }
);

export type BaseEvent = {
  baseEventId: number;
  episode: number;
  name: EventName;
  castaways: string[];
  tribes: string[];
  keywords: string[];
  notes: string[];
};

