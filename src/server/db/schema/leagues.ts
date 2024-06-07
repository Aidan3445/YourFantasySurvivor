import { createTable } from "./createTable";
import { seasons } from "./seasons";
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

export const reference = pgEnum("reference", ["castaway", "tribe", "member"]);
export type Reference = (typeof reference.enumValues)[number];
