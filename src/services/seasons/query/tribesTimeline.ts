import 'server-only';

import { db } from '~/server/db';
import { aliasedTable, and, desc, eq } from 'drizzle-orm';
import { baseEventReferenceSchema, baseEventSchema } from '~/server/db/schema/baseEvents';
import { castawaySchema } from '~/server/db/schema/castaways';
import { episodeSchema } from '~/server/db/schema/episodes';
import { tribeSchema } from '~/server/db/schema/tribes';
import { type TribesTimeline } from '~/types/tribes';
import { unstable_cache } from 'next/cache';

/**
  * Get the members of each tribe for each episode in a season
  * @param seasonId The season to get scores for
  * @returns The members of each tribe for each episode
  * @returnObj `TribesTimeline`
  */
export default async function getTribesTimeline(seasonId: number) {
  return unstable_cache(
    async (seasonId: number) => fetchTribesTimeline(seasonId),
    ['tribes-timeline', seasonId.toString()],
    {
      revalidate: 3600, // 1 hour
      tags: [
        `tribe-members-${seasonId}`,
        'tribe-members',
        `tribes-${seasonId}`,
        'tribes',
        `castaways-${seasonId}`,
        'castaways',
      ]
    }
  )(seasonId);
}

async function fetchTribesTimeline(seasonId: number) {
  const tribeReference = aliasedTable(baseEventReferenceSchema, 'tribeReference');
  const castawayReference = aliasedTable(baseEventReferenceSchema, 'castawayReference');

  return db
    .select({
      episodeNumber: episodeSchema.episodeNumber,
      tribeId: tribeSchema.tribeId,
      castawayId: castawaySchema.castawayId,
    })
    .from(episodeSchema)
    .innerJoin(baseEventSchema, and(
      eq(episodeSchema.episodeId, baseEventSchema.episodeId),
      eq(baseEventSchema.eventName, 'tribeUpdate')))
    .innerJoin(tribeReference, and(
      eq(baseEventSchema.baseEventId, tribeReference.baseEventId),
      eq(tribeReference.referenceType, 'Tribe')))
    .innerJoin(tribeSchema, eq(tribeReference.referenceId, tribeSchema.tribeId))
    .innerJoin(castawayReference, and(
      eq(baseEventSchema.baseEventId, castawayReference.baseEventId),
      eq(castawayReference.referenceType, 'Castaway')))
    .innerJoin(castawaySchema, eq(castawayReference.referenceId, castawaySchema.castawayId))
    .where(eq(episodeSchema.seasonId, seasonId))
    .orderBy(desc(episodeSchema.episodeNumber))
    .then((rows) => rows.reduce((acc, row) => {
      acc[row.episodeNumber] ??= {};
      const updates = acc[row.episodeNumber]!;
      updates[row.tribeId] ??= [];
      updates[row.tribeId]!.push(row.castawayId);
      return acc;
    }, {} as TribesTimeline));
}
