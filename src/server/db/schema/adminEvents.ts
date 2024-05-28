import { createTable } from "./createTable";
import { castaways } from "./castaways";
import { tribes } from "./tribes";
import { episodes } from "./episodes";
import { leagues, reference } from "./leagues";
import { leagueMembers } from "./members";
import { integer, primaryKey, serial, varchar } from "drizzle-orm/pg-core";

export const adminEventRules = createTable(
    "event_admin_rule",
    {
        id: serial("admin_rule_id").notNull().primaryKey(),
        league: integer("league_id").references(() => leagues.id).notNull(),
        name: varchar("name", { length: 32 }).notNull(),
        description: varchar("description", { length: 256 }).notNull(),
        points: integer("points").notNull(),
        referenceType: reference("reference_type").notNull(),
    }
);
export type AdminEventRule = typeof adminEventRules.$inferSelect;

export const adminEvents = createTable(
    "event_admin",
    {
        id: serial("event_admin_id").notNull().primaryKey(),
        rule: integer("rule_id").references(() => adminEventRules.id).notNull(),
        episode: integer("episode_id").references(() => episodes.id).notNull(),
    }
);
export type AdminEvent = typeof adminEvents.$inferSelect;

export const adminEventCastaways = createTable(
    "event_admin_castaway",
    {
        event: integer("event_id").references(() => adminEvents.id).notNull(),
        castaway: integer("castaway_id").references(() => castaways.id).notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.event, table.castaway] }),
    })
);

export const adminEventTribes = createTable(
    "event_admin_tribe",
    {
        event: integer("event_id").references(() => adminEvents.id).notNull(),
        tribe: integer("tribe_id").references(() => tribes.id).notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.event, table.tribe] }),
    })
);

export const adminEventMembers = createTable(
    "event_admin_member",
    {
        event: integer("event_id").references(() => adminEvents.id).notNull(),
        member: integer("member_id").references(() => leagueMembers.id).notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.event, table.member] }),
    })
);

