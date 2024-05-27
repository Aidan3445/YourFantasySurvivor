import { createTable } from "./createTable";
import { seasons } from "./seasons";
import { tribes } from "./tribes";
import { castaways } from "./castaways";
import { integer, serial, varchar, smallint, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

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
