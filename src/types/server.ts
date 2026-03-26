import type * as seasons from '~/server/db/schema/seasons';
import type * as tribes from '~/server/db/schema/tribes';
import type * as castaways from '~/server/db/schema/castaways';
import type * as episodes from '~/server/db/schema/episodes';
import type * as leagues from '~/server/db/schema/leagues';
import type * as members from '~/server/db/schema/leagueMembers';
import { type PgTransaction } from 'drizzle-orm/pg-core';
import { type NeonDatabase, type NeonQueryResultHKT } from 'drizzle-orm/neon-serverless';
import { type ExtractTablesWithRelations } from 'drizzle-orm';

export type Primitive = string | number | boolean | undefined | null;

export type DBTableSchemas = {
  seasons: typeof seasons;
  tribes: typeof tribes;
  castaways: typeof castaways;
  episodes: typeof episodes;
  leagues: typeof leagues;
  members: typeof members;
};

export type DB = NeonDatabase<DBTableSchemas>;

export type DBTransaction = PgTransaction<
  NeonQueryResultHKT,
  DBTableSchemas,
  ExtractTablesWithRelations<DBTableSchemas>
>;
