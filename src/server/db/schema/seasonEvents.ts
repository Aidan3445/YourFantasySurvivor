import { createTable } from './createTable';
import { castaways } from './castaways';
import { tribes } from './tribes';
import { episodes } from './episodes';
import { leagues, pointRange, reference } from './leagues';
import { leagueMembers } from './members';
import { integer, pgEnum, primaryKey, serial, varchar } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { description, eventName } from './customEvents';

export const eventTiming = pgEnum('event_season_timing', ['premiere', 'merge', 'finale']);

export const seasonEventRules = createTable(
  'event_season_rule',
  {
    id: serial('season_rule_id').notNull().primaryKey(),
    league: integer('league_id').references(() => leagues.id, { onDelete: 'cascade' }).notNull(),
    name: varchar('name', { length: 32 }).notNull(),
    // weekly events either exist on their own
    // or are tied to an admin or base event
    //adminEvent: integer('admin_event_id').references(() => customEventRules.id),
    //baseEvent: integer('base_event_id').references(() => baseEventRules.id),
    description: varchar('description', { length: 256 }).notNull(),
    points: integer('points').notNull(),
    referenceType: reference('reference_type').notNull(),
    timing: eventTiming('timing').notNull(),
  }
);

export const SeasonEventRule = z.object({
  id: z.number().optional(),
  name: eventName,
  //adminEvent: z.number().nullable(),
  //baseEvent: z.number().nullable(),
  description: description,
  points: pointRange,
  referenceType: z.enum(reference.enumValues),
  // nullable internally but not in the database
  // the database will enforce a value
  timing: z.enum(eventTiming.enumValues)
});/*.refine((rule) => {
  const refAdmin = rule.adminEvent !== null;
  const refBase = rule.baseEvent !== null;
  const newRule = rule.name !== null && rule.description !== null && rule.referenceType !== null;

  // rule must be tied to an admin event, base event, or be a new rule
  // it should not reference both an admin and base event or
  // be a new rule with a reference of either type
  return (refAdmin && !refBase && !newRule)
    || (!refAdmin && refBase && !newRule)
    || (!refAdmin && !refBase && newRule);
});*/

export type SeasonEventRuleType = z.infer<typeof SeasonEventRule>;

export const seasons = createTable(
  'event_season',
  {
    id: serial('event_season_id').notNull().primaryKey(),
    rule: integer('rule_id').references(() => seasonEventRules.id, { onDelete: 'cascade' }).notNull(),
    episode: integer('episode_id').references(() => episodes.id, { onDelete: 'cascade' }).notNull(),
    member: integer('member_id').references(() => leagueMembers.id, { onDelete: 'cascade' }).notNull(),
  }
);

export const seasonCastaways = createTable(
  'event_season_castaway',
  {
    season: integer('season_id').references(() => seasons.id, { onDelete: 'cascade' }).notNull(),
    castaway: integer('castaway_id').references(() => castaways.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.season, table.castaway] }),
  })
);

export const seasonTribes = createTable(
  'event_season_tribe',
  {
    season: integer('season_id').references(() => seasons.id, { onDelete: 'cascade' }).notNull(),
    tribe: integer('tribe_id').references(() => tribes.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.season, table.tribe] }),
  })
);

export const seasonMembers = createTable(
  'event_season_member',
  {
    season: integer('season_id').references(() => seasons.id, { onDelete: 'cascade' }).notNull(),
    member: integer('member_id').references(() => leagueMembers.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.season, table.member] }),
  })
);
