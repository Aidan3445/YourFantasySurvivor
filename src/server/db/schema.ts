// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
    index,
    pgTableCreator,
    serial,
    timestamp,
    date,
    varchar,
    smallint,
    integer,
    json,
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
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 64 }).notNull(),
        premierDate: date("premier_date").notNull(),
        finaleDate: date("finale_date"),
        mergeEpisode: integer("merge_episode"),
    },
    (table) => ({
        nameIndex: index("season_name_idx").on(table.name),
    })
);

export const tribes = createTable(
    "tribe",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 16 }).notNull(),
        color: varchar("color", { length: 7 }).notNull(),
        seasonId: integer("season_id").references(() => seasons.id).notNull(),
    },
    (table) => ({
        nameIndex: index("tribe_name_idx").on(table.name),
        seasonIndex: index("tribe_season_idx").on(table.seasonId),
    })
);

export const castaways = createTable(
    "castaway",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 64 }).notNull(),
        age: serial("age").notNull(),
        hometown: varchar("hometown", { length: 128 }).notNull().default("Unknown"),
        residence: varchar("residence", { length: 128 }).notNull().default("Unknown"),
        job: varchar("job", { length: 128 }).notNull().default("Unknown"),
        seasonId: integer("season_id").references(() => seasons.id).notNull(),
    },
    (table) => ({
        nameIndex: index("castaway_name_idx").on(table.name),
        seasonIndex: index("castaway_season_idx").on(table.seasonId),
    })
);

type NoteModel = {
    survivors: number[];
    notes: string[];
};

export const episodes = createTable(
    "episode",
    {
        id: serial("id").primaryKey(),
        number: smallint("number").notNull(),
        name: varchar("name", { length: 64 }).notNull(),
        airDate: timestamp("air_date").notNull(),
        runtime: smallint("runtime").default(90),
        seasonId: integer("season_id").references(() => seasons.id).notNull(),

        // basic events
        e_advFound: integer("e_advFound").array().notNull().default(sql`ARRAY[]::integer[]`),
        e_advPlay: integer("e_advPlay").array().notNull().default(sql`ARRAY[]::integer[]`),
        e_badAdvPlay: integer("e_badAdvPlay").array().notNull().default(sql`ARRAY[]::integer[]`),
        e_advElim: integer("e_advElim").array().notNull().default(sql`ARRAY[]::integer[]`),
        e_spokeEpTitle: integer("e_spokeEpTitle").array().notNull().default(sql`ARRAY[]::integer[]`),
        e_tribe1st: integer("e_tribe1st").array().notNull().default(sql`ARRAY[]::integer[]`),
        e_tribe2nd: integer("e_tribe2nd").array().notNull().default(sql`ARRAY[]::integer[]`),
        e_indivWin: integer("e_indivWin").array().notNull().default(sql`ARRAY[]::integer[]`),
        e_indivReward: integer("e_indivReward").array().notNull().default(sql`ARRAY[]::integer[]`),
        e_finalThree: integer("e_finalThree").array().notNull().default(sql`ARRAY[]::integer[]`),
        e_fireWin: integer("e_fireWin").array().notNull().default(sql`ARRAY[]::integer[]`),
        e_soleSurvivor: integer("e_soleSurvivor").array().notNull().default(sql`ARRAY[]::integer[]`),
        e_elim: integer("e_elim").array().notNull().default(sql`ARRAY[]::integer[]`),
        e_notes: json("e_notes").$type<NoteModel>().array().notNull().default(sql`ARRAY[]::json[]`),
    },
    (table) => ({
        numberIndex: index("episode_number_idx").on(table.number),
        nameIndex: index("episode_name_idx").on(table.name),
    })
);

type RuleType = "adminEvent" | "weeklyVote" | "weeklyPredict" | "preseasonPredict" | "mergePredict";
type RuleModel = {
    name: string;
    description: string;
    points: number;
    type: RuleType;
};
type LeagueSettings = {
    locked: boolean;
    pickCount: number;
    uniqueDraft: boolean;
};

type CustomEvent = {
    ruleNumber: number;
    castaways: number[];
};
type CustomEpisode = {
    episodeNumber: number;
    events: CustomEvent[];
};

type SurvivorUpdate = {
    castawayId: number;
    episodeNumber: number;
};
type LeagueMember = {
    userId: number;
    predictions: number[];
    survivorUpdates: SurvivorUpdate[];
};

export const leagues = createTable(
    "league",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 64 }).notNull(),
        password: varchar("password", { length: 64 }).notNull(),
        seasonId: integer("season_id").references(() => seasons.id).notNull(),
        ownerId: integer("owner_id").notNull(),
        members: json("members").$type<LeagueMember>().array().notNull().default(sql`ARRAY[]::json[]`),
        admins: integer("admins").array().notNull().default(sql`ARRAY[]::integer[]`),

        // league settings
        settings: json("settings").$type<LeagueSettings>().notNull().default(sql`'{}'::json`),
        rules: json("rules").$type<RuleModel>().array().notNull().default(sql`ARRAY[]::json[]`),
        episodes: json("episodes").$type<CustomEpisode>().array().notNull().default(sql`ARRAY[]::json[]`),
    },
    (table) => ({
        nameIndex: index("league_name_idx").on(table.name),
    })
);
