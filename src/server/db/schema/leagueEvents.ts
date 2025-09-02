import 'server-only';

import { createTable } from '~/server/db/schema/createTable';
import { index, integer, pgEnum, primaryKey, serial, unique, varchar } from 'drizzle-orm/pg-core';
import { leaguesSchema } from '~/server/db/schema/leagues';
import { LeagueEventTypeOptions } from '~/types/events';
import { sql } from 'drizzle-orm';
import { episodeSchema } from '~/server/db/schema/episodes';
import { leagueMembersSchema } from '~/server/db/schema/leagueMembers';
import { notes, reference, timing } from '~/server/db/schema/shared';

export const leagueEventType = pgEnum('event_type', LeagueEventTypeOptions);

export const leagueEventsRulesSchema = createTable(
  'event_league_rule',
  {
    leagueEventRuleId: serial('league_event_rule_id').notNull().primaryKey(),
    leagueId: integer('league_id').notNull().references(() => leaguesSchema.leagueId, { onDelete: 'cascade' }),
    eventName: varchar('event_name', { length: 32 }).notNull(),
    description: varchar('event_desc', { length: 256 }).notNull(),
    points: integer('event_points').notNull(),
    eventType: leagueEventType('event_type').notNull(),
    referenceTypes: reference('reference_types').array().notNull().default(sql`ARRAY[]::event_reference[]`),
    timing: timing('event_timing').array().notNull().default(sql`ARRAY[]::event_timing[]`),
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
    episodeId: integer('episode_id').notNull().references(() => episodeSchema.episodeId, { onDelete: 'cascade' }),
    memberId: integer('member_id').notNull().references(() => leagueMembersSchema.memberId, { onDelete: 'cascade' }),
    referenceType: reference('reference_type').notNull(),
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
    episodeId: integer('episode_id').notNull().references(() => episodeSchema.episodeId, { onDelete: 'cascade' }),
    referenceType: reference('reference_type').notNull(),
    referenceId: integer('reference_id').notNull(),
    notes: notes('notes'),
  },
  (table) => [
    index().on(table.leagueEventRuleId),
    index().on(table.episodeId),
  ]
);
