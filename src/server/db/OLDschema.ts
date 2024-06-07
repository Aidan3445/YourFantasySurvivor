// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
    pgTableCreator,
    timestamp,
    date,
    varchar,
    smallint,
    integer,
    json,
    serial,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `yfs_${name}`);

export const seasons = createTable(
    "season",
    {
        id: serial("season_id").notNull().primaryKey(),
        name: varchar("name", { length: 64 }).notNull(),
        premierDate: date("premier_date").notNull(),
        finaleDate: date("finale_date"),
    }
);
export type Season = typeof seasons.$inferSelect;

export const tribes = createTable(
    "tribe",
    {
        id: serial("tribe_id").notNull().primaryKey(),
        name: varchar("name", { length: 16 }).notNull(),
        color: varchar("color", { length: 7 }).notNull(),
        season: integer("season").references(() => seasons.id).notNull(),
    }
);
export type Tribe = typeof tribes.$inferSelect;

export const castaways = createTable(
    "castaway",
    {
        id: serial("castaway_id").notNull().primaryKey(),
        name: varchar("name", { length: 64 }).notNull(),
        shortName: varchar("short_name", { length: 16 }).notNull(),
        age: smallint("age").notNull(),
        hometown: varchar("hometown", { length: 128 }).notNull().default("Unknown"),
        residence: varchar("residence", { length: 128 }).notNull().default("Unknown"),
        job: varchar("job", { length: 128 }).notNull().default("Unknown"),
        photo: varchar("photo", { length: 512 }).notNull().default("https://media.istockphoto.com/id/1980276924/vector/no-photo-thumbnail-graphic-element-no-found-or-available-image-in-the-gallery-or-album-flat.jpg?s=612x612&w=0&k=20&c=ZBE3NqfzIeHGDPkyvulUw14SaWfDj2rZtyiKv3toItk="),
        season: integer("season").references(() => seasons.id).notNull(),
    }
);
export type Castaway = typeof castaways.$inferSelect;

export const episodes = createTable(
    "episode",
    {
        id: serial("episode_id").notNull().primaryKey(),
        number: smallint("number").notNull(),
        title: varchar("name", { length: 64 }).notNull(),
        airDate: timestamp("air_date", { mode: "string" }).notNull(),
        runtime: smallint("runtime").default(90),
        season: integer("season").references(() => seasons.id).notNull(),
        merge: boolean("merge").notNull().default(false),
    }
);
export type Episode = typeof episodes.$inferSelect;

export const eventLabel = pgEnum("event_label", [
    "advFound", "advPlay", "badAdvPlay", "advElim", "spokeEpTitle", "tribe1st", "tribe2nd",
    "indivWin", "indivReward", "finalists", "fireWin", "soleSurvivor", "elim", "noVoteExit",
    "tribeUpdate", "otherNotes"]);
export type EventLabel = (typeof eventLabel.enumValues)[number];
export const episodeEvents = createTable(
    "episode_event",
    {
        id: serial("episode_event_id").notNull().primaryKey(),
        episode: integer("episode").references(() => episodes.id).notNull(),
        label: eventLabel("label").notNull(),
        castaways: integer("castaways").references(() => castaways.id).notNull().array(),
        tribes: integer("tribes").references(() => tribes.id).notNull().array(),
        keywords: varchar("keywords", { length: 32 }).array().notNull(),
        notes: varchar("notes", { length: 256 }).array().notNull(),
    }
);
export type BasicEvent = typeof episodeEvents.$inferSelect;

export const leagues = createTable(
    "league",
    {
        id: serial("league_id").notNull().primaryKey(),
        name: varchar("name", { length: 64 }).notNull(),
        password: varchar("password", { length: 64 }),
        season: integer("season_id").references(() => seasons.id).notNull(),
        settings: json("settings").$type<LeagueSettings>(),
    }
);
export type League = typeof leagues.$inferSelect;

export type LeagueSettings = {
    locked: boolean;
    pickCount: 1 | 2;
    uniquePicks: boolean;
    draftStarted: boolean;
};

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

export const leagueMembers = createTable(
    "league_member",
    {
        id: serial("league_member_id").notNull().primaryKey(),
        league: integer("league_id").references(() => leagues.id).notNull(),
        userId: varchar("user_id", { length: 64 }).notNull(),
        color: varchar("color", { length: 7 }).notNull(),
        displayName: varchar("display_name", { length: 64 }).notNull(),
        predictions: integer("predictions").array().notNull().default(sql`ARRAY[]::integer[]`),
        isOwner: boolean("is_owner").notNull().default(false),
        isAdmin: boolean("is_admin").notNull().default(false),
    }
);
export type LeagueMember = typeof leagueMembers.$inferSelect;

export const selectionUpdates = createTable(
    "selection_update",
    {
        id: serial("selection_update_id").notNull().primaryKey(),
        member: integer("member_id").references(() => leagueMembers.id).notNull(),
        episode: integer("episode_id").references(() => episodes.id).notNull(),
        oldCastaway: integer("old_castaway_id").references(() => castaways.id).notNull(),
        newCastaway: integer("new_castaway_id").references(() => castaways.id).notNull(),
    }
);
export type SelectionUpdate = typeof selectionUpdates.$inferSelect;
