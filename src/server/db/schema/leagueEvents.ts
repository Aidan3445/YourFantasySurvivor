import 'server-only';

import { createTable } from './createTable';
import { boolean, index, integer, pgEnum, primaryKey, serial, unique, varchar } from 'drizzle-orm/pg-core';
import { leaguesSchema } from './leagues';
import { LeagueEventTypeOptions, PredictionTimingOptions } from '~/server/db/defs/events';
import { sql } from 'drizzle-orm';
import { leagueEventReference } from './baseEvents';
import { episodesSchema } from './episodes';
import { leagueMembersSchema } from './leagueMembers';

export const leagueEventType = pgEnum('event_league_type', LeagueEventTypeOptions);
export const leagueEventTiming = pgEnum('event_league_timing', PredictionTimingOptions);

export const leagueEventsRulesSchema = createTable(
  'event_league_rule',
  {
    leagueEventRuleId: serial('league_event_rule_id').notNull().primaryKey(),
    leagueId: integer('league_id').notNull().references(() => leaguesSchema.leagueId, { onDelete: 'cascade' }),
    eventName: varchar('event_name', { length: 32 }).notNull(),
    description: varchar('event_desc', { length: 256 }).notNull(),
    points: integer('event_points').notNull(),
    eventType: leagueEventType('event_type').notNull(),
    referenceTypes: leagueEventReference('reference_types').array().notNull().default(sql`ARRAY['Castaway', 'Tribe']::event_league_reference[]`),
    timing: leagueEventTiming('event_timing').array().notNull().default(sql`ARRAY[]::event_league_timing[]`),
    public: boolean('public').notNull(),
  },
  (table) => [
    unique().on(table.leagueId, table.eventName),
    index().on(table.leagueId),
  ]
);

export const leagueEventPredictionsSchema = createTable(
  'event_league_prediction',
  {
    leagueEventRuleId: integer('league_event_rule_id').notNull().references(() => leagueEventsRulesSchema.leagueEventRuleId, { onDelete: 'cascade' }),
    episodeId: integer('episode_id').notNull().references(() => episodesSchema.episodeId, { onDelete: 'cascade' }),
    memberId: integer('member_id').notNull().references(() => leagueMembersSchema.memberId, { onDelete: 'cascade' }),
    referenceType: leagueEventReference('reference_type').notNull(),
    referenceId: integer('reference_id').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.leagueEventRuleId, table.episodeId, table.memberId] }),
    index().on(table.leagueEventRuleId),
    index().on(table.episodeId),
    index().on(table.memberId),
  ]
);

export const leagueEventsSchema = createTable(
  'event_league',
  {
    leagueEventId: serial('league_event_id').notNull().primaryKey(),
    leagueEventRuleId: integer('league_event_rule_id').notNull().references(() => leagueEventsRulesSchema.leagueEventRuleId, { onDelete: 'cascade' }),
    episodeId: integer('episode_id').notNull().references(() => episodesSchema.episodeId, { onDelete: 'cascade' }),
    referenceType: leagueEventReference('reference_type').notNull(),
    referenceId: integer('reference_id').notNull(),
    notes: varchar('notes', { length: 256 }).array(),
  },
  (table) => [
    index().on(table.leagueEventRuleId),
    index().on(table.episodeId),
  ]
);

export const leagueEventReferenceSchema = createTable(
  'event_league_reference',
  {
    leagueEventReferenceId: serial('league_event_reference_id').notNull().primaryKey(),
    leagueEventId: integer('league_event_id').notNull().references(() => leagueEventsSchema.leagueEventId, { onDelete: 'cascade' }),
    referenceType: leagueEventReference('reference_type').notNull(),
    referenceId: integer('reference_id').notNull(),
  },
  (table) => [
    index().on(table.leagueEventId),
    index().on(table.referenceId),
    unique().on(table.leagueEventId, table.referenceType, table.referenceId),
  ]
);
