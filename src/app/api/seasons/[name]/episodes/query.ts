import { desc, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { episodes } from '~/server/db/schema/episodes';
import { seasons } from '~/server/db/schema/seasons';

export async function getEpisodes(seasonName: string, includeFuture = false) {
  const eps = await db
    .select({ id: episodes.id, number: episodes.number, title: episodes.title, airDate: episodes.airDate })
    .from(episodes)
    .innerJoin(seasons, eq(seasons.id, episodes.season))
    .where(eq(seasons.name, seasonName))
    .orderBy(desc(episodes.number));

  if (includeFuture) return eps;

  return eps.filter((ep) => new Date(`${ep.airDate} -4:00`) <= new Date());
}
