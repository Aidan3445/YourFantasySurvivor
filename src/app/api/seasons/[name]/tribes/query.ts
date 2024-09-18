import 'server-only';
import { asc, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { seasons } from '~/server/db/schema/seasons';
import { tribes, type Tribe } from '~/server/db/schema/tribes';

export async function getTribes(seasonName: string): Promise<Tribe[]> {
  return await db
    .select()
    .from(tribes)
    .innerJoin(seasons, eq(seasons.id, tribes.season))
    .where(eq(seasons.name, seasonName))
    .orderBy(asc(tribes.name))
    .then((rows) => rows.map((row) => row.tribe));
}
