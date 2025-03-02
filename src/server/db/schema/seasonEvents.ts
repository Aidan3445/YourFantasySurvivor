import { createTable } from './createTable';
import { castawaysSchema } from './castaways';
import { tribesSchema } from './tribes';
import { leaguesSchema } from './leagues';
import { leagueMembersSchema } from './leagueMembers';
import { integer, pgEnum, serial, unique, varchar } from 'drizzle-orm/pg-core';
import { episodesSchema } from './episodes';
import { oldRef } from './customEvents';

export const seasonEventTiming = pgEnum('event_season_timing', ['premiere', 'merge', 'finale']);
export type SeasonEventTiming = (typeof seasonEventTiming.enumValues)[number];

export const seasonEventRules = createTable(
  'event_season_rule',
  {
    id: serial('season_rule_id').notNull().primaryKey(),
    league: integer('league_id').references(() => leaguesSchema.leagueId, { onDelete: 'cascade' }).notNull(),
    eventName: varchar('name', { length: 32 }).notNull(),
    // weekly events either exist on their own
    // or are tied to an admin or base event
    //adminEvent: integer('admin_event_id').references(() => customEventRules.id),
    //baseEvent: integer('base_event_id').references(() => baseEventRules.id),
    description: varchar('description', { length: 256 }).notNull(),
    points: integer('points').notNull(),
    referenceType: oldRef('reference_type').notNull(),
    timing: seasonEventTiming('timing').notNull(),
  }
);

export const seasonEvents = createTable(
  'event_season',
  {
    id: serial('event_season_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => seasonEventRules.id, { onDelete: 'cascade' }).notNull(),
    member: integer('member_id').references(() => leagueMembersSchema.memberId, { onDelete: 'cascade' }).notNull(),
  },
  (table) => [
    unique().on(table.rule, table.member),
  ]
);

export const seasonCastaways = createTable(
  'event_season_castaway',
  {
    id: serial('event_season_castaway_id').notNull().primaryKey(),
    event: integer('event_id').references(() => seasonEvents.id, { onDelete: 'cascade' }).notNull().unique(),
    reference: integer('castaway_id').references(() => castawaysSchema.castawayId, { onDelete: 'cascade' }).notNull(),
  });

export const seasonTribes = createTable(
  'event_season_tribe',
  {
    id: serial('event_season_tribe_id').notNull().primaryKey(),
    event: integer('event_id').references(() => seasonEvents.id, { onDelete: 'cascade' }).notNull().unique(),
    reference: integer('tribe_id').references(() => tribesSchema.tribeId, { onDelete: 'cascade' }).notNull(),
  });

export const seasonMembers = createTable(
  'event_season_member',
  {
    id: serial('event_season_member_id').notNull().primaryKey(),
    event: integer('event_id').references(() => seasonEvents.id, { onDelete: 'cascade' }).notNull().unique(),
    reference: integer('member_id').references(() => leagueMembersSchema.memberId, { onDelete: 'cascade' }).notNull(),
  });

export const seasonCastawayResults = createTable(
  'event_season_result_castaway',
  {
    id: serial('event_season_result_castaway_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => seasonEventRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodesSchema.episodeId, { onDelete: 'cascade' }).notNull(),
    result: integer('result').references(() => castawaysSchema.castawayId, { onDelete: 'cascade' }).notNull(),
  }
);

export const seasonTribeResults = createTable(
  'event_season_result_tribe',
  {
    id: serial('event_season_result_tribe_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => seasonEventRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodesSchema.episodeId, { onDelete: 'cascade' }).notNull(),
    result: integer('result').references(() => tribesSchema.tribeId, { onDelete: 'cascade' }).notNull(),
  }
);

export const seasonMemberResults = createTable(
  'event_season_result_member',
  {
    id: serial('event_season_result_member_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => seasonEventRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodesSchema.episodeId, { onDelete: 'cascade' }).notNull(),
    result: integer('result').references(() => leagueMembersSchema.memberId, { onDelete: 'cascade' }).notNull(),
  }
);
