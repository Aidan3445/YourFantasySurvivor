import 'server-only';
import { db } from '~/server/db';
import { desc } from 'drizzle-orm';
import { seasons } from '~/server/db/schema/seasons';


export async function getSeasons(): Promise<string[]> {
  return db
    .select({ name: seasons.name })
    .from(seasons)
    .orderBy(desc(seasons.premierDate))
    .then((seasons) => seasons.map((season) => season.name));
}

export async function getLatestSeason(): Promise<number> {
  return db
    .select({ id: seasons.id })
    .from(seasons)
    .orderBy(desc(seasons.premierDate))
    .then((seasons) => seasons[0]?.id ?? 0);
}
