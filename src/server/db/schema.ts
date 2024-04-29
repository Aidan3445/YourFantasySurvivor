// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
    index,
    pgTableCreator,
    timestamp,
    date,
    varchar,
    smallint,
    integer,
    json,
    boolean,
    primaryKey,
    foreignKey,
    uniqueIndex,
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
        name: varchar("name", { length: 64 }).notNull().primaryKey(),
        premierDate: date("premier_date").notNull(),
        finaleDate: date("finale_date"),
        mergeEpisode: integer("merge_episode"),
    }
);

export const tribes = createTable(
    "tribe",
    {
        name: varchar("name", { length: 16 }).notNull(),
        color: varchar("color", { length: 7 }).notNull(),
        mergeTribe: boolean("merge_tribe").notNull().default(false),
        season: varchar("season").references(() => seasons.name).notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.name, table.season] }),
        nameIndex: uniqueIndex("tribe_name_idx").on(table.name),
        seasonIndex: index("tribe_season_idx").on(table.season),
    })
);

export const castaways = createTable(
    "castaway",
    {
        name: varchar("name", { length: 64 }).notNull(),
        age: smallint("age").notNull(),
        hometown: varchar("hometown", { length: 128 }).notNull().default("Unknown"),
        residence: varchar("residence", { length: 128 }).notNull().default("Unknown"),
        job: varchar("job", { length: 128 }).notNull().default("Unknown"),
        photo: varchar("photo", { length: 1024 }).notNull().default("https://media.istockphoto.com/id/1980276924/vector/no-photo-thumbnail-graphic-element-no-found-or-available-image-in-the-gallery-or-album-flat.jpg?s=612x612&w=0&k=20&c=ZBE3NqfzIeHGDPkyvulUw14SaWfDj2rZtyiKv3toItk="),
        tribe: varchar("tribe", { length: 16 }).references(() => tribes.name).notNull(),
        season: varchar("season").references(() => seasons.name).notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.name, table.season] }),
        seasonIndex: index("castaway_season_idx").on(table.season),
        tribeFK: foreignKey({
            columns: [table.tribe, table.season],
            foreignColumns: [tribes.name, tribes.season],
            name: "castaway_tribe_fk",
        }),
    })
);

type NoteModel = {
    survivors: number[];
    notes: string[];
};

export const episodes = createTable(
    "episode",
    {
        number: smallint("number").notNull(),
        name: varchar("name", { length: 64 }).notNull(),
        airDate: timestamp("air_date").notNull(),
        runtime: smallint("runtime").default(90),
        season: varchar("season").references(() => seasons.name).notNull(),

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
        e_notes: json("e_notes").$type<NoteModel[]>(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.season, table.number] }),
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

export const leagues = createTable(
    "league",
    {
        name: varchar("name", { length: 64 }).notNull().primaryKey(),
        password: varchar("password", { length: 64 }).notNull(),
        season: varchar("season_id").references(() => seasons.name).notNull(),
        ownerId: varchar("owner_id", { length: 64 }).notNull(),
        adminIds: varchar("admin_ids", { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar[]`),

        // league settings
        settings: json("settings").$type<LeagueSettings>().notNull().default(sql`'{}'::json`),
        rules: json("rules").$type<RuleModel[]>(),
        episodes: json("episodes").$type<CustomEpisode[]>(),
    },
    (table) => ({
        ownerIndex: index("league_owner_idx").on(table.ownerId),
    })
);

type SurvivorUpdate = {
    castawayId: number;
    episodeNumber: number;
};

export const leagueMembers = createTable(
    "league_member",
    {
        league: varchar("league_id").references(() => leagues.name).notNull().primaryKey(),
        userId: varchar("user_id", { length: 64 }).notNull(),
        color: varchar("color", { length: 7 }).notNull(),
        displayName: varchar("display_name", { length: 64 }).notNull(),
        predictions: integer("predictions").array().notNull().default(sql`ARRAY[]::integer[]`),
        survivorUpdates: json("survivor_updates").$type<SurvivorUpdate[]>()
    },
    (table) => ({
        userIndex: index("league_member_user_idx").on(table.userId),
    })
);
