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
export type Season = typeof seasons.$inferSelect;

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
export type Tribe = typeof tribes.$inferSelect;

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
export type Castaway = typeof castaways.$inferSelect;

type TribeUpdate = {
    tribe: string;
    castaways: string[];
};
type NoteModel = {
    castaways: number[];
    notes: string[];
};

export const episodes = createTable(
    "episode",
    {
        number: smallint("number").notNull(),
        title: varchar("name", { length: 64 }).notNull(),
        airDate: timestamp("air_date", { mode: "string" }).notNull(),
        runtime: smallint("runtime").default(90),
        season: varchar("season").references(() => seasons.name).notNull(),

        // basic events
        e_advFound: varchar("e_advFound", { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar[]`),
        e_advPlay: varchar("e_advPlay", { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar[]`),
        e_badAdvPlay: varchar("e_badAdvPlay", { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar[]`),
        e_advElim: varchar("e_advElim", { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar[]`),
        e_spokeEpTitle: varchar("e_spokeEpTitle", { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar[]`),
        e_tribe1st: varchar("e_tribe1st", { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar[]`),
        e_tribe2nd: varchar("e_tribe2nd", { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar[]`),
        e_indivWin: varchar("e_indivWin", { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar[]`),
        e_indivReward: varchar("e_indivReward", { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar[]`),
        e_final: varchar("e_final", { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar[]`),
        e_fireWin: varchar("e_fireWin", { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar[]`),
        e_soleSurvivor: varchar("e_soleSurvivor", { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar[]`),
        e_elim: varchar("e_elim", { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar[]`),
        e_noVoteExit: varchar("e_noVoteExit", { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar[]`),
        e_tribeUpdate: json("e_tribeUpdate").$type<TribeUpdate[]>(),
        e_notes: json("e_notes").$type<NoteModel[]>(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.season, table.number] }),
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
export type League = typeof leagues.$inferSelect;

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
export type LeagueMember = typeof leagueMembers.$inferSelect;
