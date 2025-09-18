import 'server-only';

import { createTable } from '~/server/db/schema/createTable';
import { index, integer, pgEnum, primaryKey, serial, unique, varchar } from 'drizzle-orm/pg-core';
import { leagueSchema } from '~/server/db/schema/leagues';
import { sql } from 'drizzle-orm';
import { episodeSchema } from '~/server/db/schema/episodes';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { notes, reference, timing } from '~/server/db/schema/shared';
import { EventTypes } from '~/lib/events';

export const leagueEventType = pgEnum('event_type', EventTypes);

export const leagueEventsRulesSchema = createTable(
  'event_league_rule',
  {
    leagueEventRuleId: serial('league_event_rule_id').notNull().primaryKey(),
    leagueId: integer('league_id').notNull().references(() => leagueSchema.leagueId, { onDelete: 'cascade' }),
    eventName: varchar('event_name', { length: 32 }).notNull(),
    description: varchar('event_desc', { length: 256 }).notNull(),
    points: integer('event_points').notNull(),
    eventType: leagueEventType('event_type').notNull(),
    referenceTypes: reference('reference_types').array().notNull().default(sql`ARRAY[]::event_reference[]`),
    timing: timing('event_timing').array().notNull().default(sql`ARRAY[]::event_timing[]`),
  },
  (table) => [
    unique('rule_league_event_unq').on(table.leagueId, table.eventName),
    index('rule_league_idx').on(table.leagueId),
  ]
);

export const leagueEventPredictionsSchema = createTable(
  'event_league_prediction',
  {
    leagueEventRuleId: integer('league_event_rule_id').notNull().references(() => leagueEventsRulesSchema.leagueEventRuleId, { onDelete: 'cascade' }),
    episodeId: integer('episode_id').notNull().references(() => episodeSchema.episodeId, { onDelete: 'cascade' }),
    memberId: integer('member_id').notNull().references(() => leagueMemberSchema.memberId, { onDelete: 'cascade' }),
    referenceType: reference('reference_type').notNull(),
    referenceId: integer('reference_id').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.leagueEventRuleId, table.episodeId, table.memberId] }),
    index('pred_rule_idx').on(table.leagueEventRuleId),
    index('pred_episode_idx').on(table.episodeId),
    index('pred_member_idx').on(table.memberId),
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
    index('event_rule_idx').on(table.leagueEventRuleId),
    index('event_episode_idx').on(table.episodeId),
  ]
);
