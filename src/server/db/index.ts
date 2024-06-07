import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from "@vercel/postgres";
import * as seasons from "./schema/seasons";
import * as tribes from "./schema/tribes";
import * as castaways from "./schema/castaways";
import * as episodes from "./schema/episodes";
import * as leagues from "./schema/leagues";
import * as adminEvents from "./schema/adminEvents";
import * as weeklyEvents from "./schema/weeklyEvents";
import * as predictions from "./schema/predictions";
import * as members from "./schema/members";

// Define your schema
const schema = {
    seasons, tribes, castaways, episodes, leagues,
    adminEvents, weeklyEvents, predictions, members
};

// Use this object to send drizzle queries to your DB
export const db = drizzle(sql, { schema });
