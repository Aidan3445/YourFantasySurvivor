import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as seasons from '~/server/db/schema/seasons';
import * as tribes from '~/server/db/schema/tribes';
import * as castaways from '~/server/db/schema/castaways';
import * as episodes from '~/server/db/schema/episodes';
import * as leagues from '~/server/db/schema/leagues';
import * as members from '~/server/db/schema/leagueMembers';
import * as customEvents from '~/server/db/schema/customEvents';

// Define your schema
const schema = {
  seasons, tribes, castaways, episodes, leagues, members, customEvents,
};

// Use this object to send drizzle queries to your DB
export const db = drizzle(sql, { schema });
