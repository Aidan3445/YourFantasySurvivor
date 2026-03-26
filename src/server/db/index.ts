import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as seasons from '~/server/db/schema/seasons';
import * as tribes from '~/server/db/schema/tribes';
import * as castaways from '~/server/db/schema/castaways';
import * as episodes from '~/server/db/schema/episodes';
import * as leagues from '~/server/db/schema/leagues';
import * as members from '~/server/db/schema/leagueMembers';
import { type DB, type DBTableSchemas } from '~/types/server';

// Define your schema
const schema: DBTableSchemas = {
  seasons, tribes, castaways, episodes, leagues, members,
};

// Use Pool for proper WebSocket-based transaction support
const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

// Use this object to send drizzle queries to your DB
export const db: DB = drizzle(pool, { schema });
