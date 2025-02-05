import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as seasons from './schema/seasons';
import * as tribes from './schema/tribes';
import * as castaways from './schema/castaways';
import * as episodes from './schema/episodes';
import * as leagues from './schema/leagues';
import * as customEvents from './schema/customEvents';
import * as weeklyEvents from './schema/weeklyEvents';
import * as seasonEvents from './schema/seasonEvents';
import * as members from './schema/leagueMembers';

// Define your schema
const schema = {
  seasons, tribes, castaways, episodes, leagues,
  customEvents, weeklyEvents, seasonEvents, members
};

// Use this object to send drizzle queries to your DB
export const db = drizzle(sql, { schema });
