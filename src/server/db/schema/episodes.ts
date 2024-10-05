import { createTable } from './createTable';
import { seasons } from './seasons';
import { tribes } from './tribes';
import { castaways } from './castaways';
import { integer, serial, varchar, smallint, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';

export const episodes = createTable(
  'episode',
  {
    id: serial('episode_id').notNull().primaryKey(),
    number: smallint('number').notNull(),
    title: varchar('title', { length: 64 }).notNull(),
    airDate: timestamp('air_date', { mode: 'string' }).notNull(),
    runtime: smallint('runtime').default(90),
    season: integer('season_id').references(() => seasons.id, { onDelete: 'cascade' }).notNull(),
    merge: boolean('merge').default(false),
  }
);
export type Episode = typeof episodes.$inferSelect;

export const eventName = pgEnum('event_name', [
  'advFound', 'advPlay', 'badAdvPlay', 'advElim', 'spokeEpTitle', 'tribe1st', 'tribe2nd',
  'indivWin', 'indivReward', 'finalists', 'fireWin', 'soleSurvivor', 'elim', 'noVoteExit',
  'tribeUpdate', 'otherNotes']);
export type EventName = (typeof eventName.enumValues)[number];

export const baseEvents = createTable(
  'event_base',
  {
    id: serial('event_base_id').notNull().primaryKey(),
    episode: integer('episode_id').references(() => episodes.id, { onDelete: 'cascade' }).notNull(),
    eventName: eventName('name').notNull(),
    keywords: varchar('keywords', { length: 32 }).array().notNull(),
    notes: varchar('notes', { length: 256 }).array().notNull(),
  }
);

export const baseEventCastaways = createTable(
  'event_base_castaway',
  {
    id: serial('event_base_castaway_id').notNull().primaryKey(),
    event: integer('event_id').references(() => baseEvents.id, { onDelete: 'cascade' }).notNull(),
    reference: integer('castaway_id').references(() => castaways.id, { onDelete: 'cascade' }).notNull(),
  }
);
export const baseEventTribes = createTable(
  'event_base_tribe',
  {
    id: serial('event_base_tribe_id').notNull().primaryKey(),
    event: integer('event_id').references(() => baseEvents.id, { onDelete: 'cascade' }).notNull(),
    reference: integer('tribe_id').references(() => tribes.id, { onDelete: 'cascade' }).notNull(),
  }
);
export type BaseEvent = {
  id: number;
  episode: number;
  name: EventName;
  castaways: string[];
  tribes: string[];
  keywords: string[];
  notes: string[];
};

