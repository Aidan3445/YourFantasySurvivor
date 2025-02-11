import 'server-only';
import { createTable } from './createTable';
import { boolean, index, integer, pgEnum, serial, unique, varchar } from 'drizzle-orm/pg-core';
import { leaguesSchema } from './leagues';
import { LeagueEventTypeOptions, LeaguePredictionTimingOptions, ReferenceOptions } from '../defs/events';
import { sql } from 'drizzle-orm';

export const leagueEventType = pgEnum('event_league_type', LeagueEventTypeOptions);
export const leagueEventTiming = pgEnum('event_league_timing', LeaguePredictionTimingOptions);

export const leagueEventsRulesSchema = createTable(
  'event_league_rule',
  {
    leagueEventId: serial('league_event_id').notNull().primaryKey(),
    leagueId: integer('league_id').notNull().references(() => leaguesSchema.leagueId, { onDelete: 'cascade' }),
    eventName: varchar('event_name', { length: 32 }).notNull(),
    description: varchar('event_desc', { length: 256 }).notNull(),
    points: integer('event_points').notNull(),
    type: leagueEventType('event_type').notNull(),
    timing: leagueEventTiming('event_timing').array().notNull().default(sql`ARRAY[]::event_league_timing[]`),
    public: boolean('public').notNull(),
  },
  (table) => [
    unique().on(table.leagueId, table.eventName),
    index().on(table.leagueId),
  ]
);

export const leagueEventReference = pgEnum('event_league_reference', ReferenceOptions);
