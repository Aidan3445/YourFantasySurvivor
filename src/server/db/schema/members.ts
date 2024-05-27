import { createTable } from "./createTable";
import { leagues } from "./leagues";
import { episodes } from "./episodes";
import { castaways } from "./castaways";
import { integer, serial, varchar, boolean } from "drizzle-orm/pg-core";

export const leagueMembers = createTable(
    "league_member",
    {
        id: serial("league_member_id").notNull().primaryKey(),
        league: integer("league_id").references(() => leagues.id).notNull(),
        userId: varchar("user_id", { length: 64 }).notNull(),
        color: varchar("color", { length: 7 }).notNull(),
        displayName: varchar("display_name", { length: 64 }).notNull(),
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
        castaway: integer("new_castaway_id").references(() => castaways.id).notNull(),
    }
);
export type SelectionUpdate = typeof selectionUpdates.$inferSelect;
