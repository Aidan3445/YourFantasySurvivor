import { createTable } from "./createTable";
import { seasons } from "./seasons";
import { integer, serial, varchar } from "drizzle-orm/pg-core";

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
