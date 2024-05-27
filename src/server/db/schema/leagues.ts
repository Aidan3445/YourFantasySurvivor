import { createTable } from "./createTable";
import { seasons } from "./seasons";
import { episodes } from "./episodes";
import { integer, json, pgEnum, serial, varchar } from "drizzle-orm/pg-core";

export type LeagueSettings = {
    locked: boolean;
    pickCount: 1 | 2;
    uniquePicks: boolean;
};
export const defaultSettings: LeagueSettings = {
    locked: false,
    pickCount: 1,
    uniquePicks: true,
};

export const leagues = createTable(
    "league",
    {
        id: serial("league_id").notNull().primaryKey(),
        name: varchar("name", { length: 64 }).notNull(),
        password: varchar("password", { length: 64 }),
        season: integer("season_id").references(() => seasons.id).notNull(),
        settings: json("settings").$type<LeagueSettings>().notNull().default(defaultSettings),
    }
);
export type League = typeof leagues.$inferSelect;

export const adminEventRules = createTable(
    "admin_event",
    {
        id: serial("admin_event_id").notNull().primaryKey(),
        league: integer("league_id").references(() => leagues.id).notNull(),
        name: varchar("name", { length: 32 }).notNull(),
        description: varchar("description", { length: 256 }).notNull(),
        points: integer("points").notNull(),
    }
);

export const ruleType = pgEnum("rule_type", ["adminEvent", "weeklyVote", "weeklyPredict", "preseasonPredict", "mergePredict"]);
export type RuleType = (typeof ruleType.enumValues)[number];
export const reference = pgEnum("reference", ["castaway", "tribe", "member"]);
export type Reference = (typeof reference.enumValues)[number];
export const leagueRules = createTable(
    "league_rule",
    {
        id: serial("league_rule_id").notNull().primaryKey(),
        league: integer("league_id").references(() => leagues.id).notNull(),
        name: varchar("name", { length: 32 }).notNull(),
        description: varchar("description", { length: 256 }).notNull(),
        points: integer("points").notNull(),
        type: ruleType("type").notNull(),
        referenceType: reference("reference_type").notNull(),
    }
);
export type LeagueRule = typeof leagueRules.$inferSelect;

export const leagueEvents = createTable(
    "league_event",
    {
        id: serial("league_event_id").notNull().primaryKey(),
        league: integer("league_id").references(() => leagues.id).notNull(),
        episode: integer("episode_id").references(() => episodes.id).notNull(),
        event: integer("event_id").references(() => leagueRules.id).notNull(),
        reference: integer("reference_id").notNull(),
    }
);

