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
    uniqueIndex,
    serial,
    boolean,
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
    },
    (table) => ({
        nameIndex: uniqueIndex("tribe_name_idx").on(table.name),
        seasonIndex: index("tribe_season_idx").on(table.season),
    })
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
    },
    (table) => ({
        seasonIndex: index("castaway_season_idx").on(table.season),
    })
);
export type Castaway = typeof castaways.$inferSelect;

export type NoteModel = {
    castawayIDs: number[];
    tribeIDs: number[];
    keywords: string[];
    notes: string[];
};

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

        // basic events
        e_advFound: json("e_advFound").$type<NoteModel[]>(),
        e_advPlay: json("e_advPlay").$type<NoteModel[]>(),
        e_badAdvPlay: json("e_badAdvPlay").$type<NoteModel[]>(),
        e_advElim: json("e_advElim").$type<NoteModel[]>(),
        e_spokeEpTitle: json("e_spokeEpTitle").$type<NoteModel[]>(),
        e_tribe1st: json("e_tribe1st").$type<NoteModel[]>(),
        e_tribe2nd: json("e_tribe2nd").$type<NoteModel[]>(),
        e_indivWin: json("e_indivWin").$type<NoteModel[]>(),
        e_indivReward: json("e_indivReward").$type<NoteModel[]>(),
        e_finalists: json("e_finalists").$type<NoteModel[]>(),
        e_fireWin: json("e_fireWin").$type<NoteModel[]>(),
        e_soleSurvivor: json("e_soleSurvivor").$type<NoteModel[]>(),
        e_elim: json("e_elim").$type<NoteModel[]>(),
        e_noVoteExit: json("e_noVoteExit").$type<NoteModel[]>(),
        e_tribeUpdate: json("e_tribeUpdate").$type<NoteModel[]>(),
        e_otherNotes: json("e_notes").$type<NoteModel[]>(),
    },
    (table) => ({
    })
);
export type Episode = typeof episodes.$inferSelect;

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
        id: serial("league_id").notNull().primaryKey(),
        name: varchar("name", { length: 64 }).notNull(),
        password: varchar("password", { length: 64 }).notNull(),
        season: integer("season_id").references(() => seasons.id).notNull(),
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
export type League = typeof leagues.$inferSelect;

type SurvivorUpdate = {
    castawayId: number;
    episodeNumber: number;
};

export const leagueMembers = createTable(
    "league_member",
    {
        league: integer("league_id").references(() => leagues.id).notNull().primaryKey(),
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
export type LeagueMember = typeof leagueMembers.$inferSelect;
