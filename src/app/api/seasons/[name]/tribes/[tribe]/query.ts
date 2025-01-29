import 'server-only';
import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import { baseEventTribes } from '~/server/db/schema/episodes';
import { tribes } from '~/server/db/schema/tribes';

export async function getTribe(seasonId: number, tribeId: number) {
  const detailsFetch = db
    .select()
    .from(tribes)
    .where(and(eq(tribes.tribeId, tribeId), eq(tribes.season, seasonId)));
  const eventFetch = db
    .select()
    .from(baseEventTribes)
    .innerJoin(tribes, eq(baseEventTribes.referenceId, tribes.tribeId))
    .where(eq(baseEventTribes.referenceId, tribeId));

  const [[details], events] = await Promise.all([detailsFetch, eventFetch]);

  if (!details) throw new Error('Tribe not found');

  return { details, events };
}
