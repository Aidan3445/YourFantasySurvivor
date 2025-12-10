import 'server-only';

import { and, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { seasonSchema } from '~/server/db/schema/seasons';
import { type CastawayInsert } from '~/types/castaways';
import { castawaySchema } from '~/server/db/schema/castaways';
import { tribeSchema } from '~/server/db/schema/tribes';
import { baseEventReferenceSchema, baseEventSchema } from '~/server/db/schema/baseEvents';
import { episodeSchema } from '~/server/db/schema/episodes';
import getEpisodes from '~/services/seasons/query/episodes';
import { revalidateTag } from 'next/cache';

/**
  * Create a new castaway
  * @param seasonName The season name to create the episode in
  * @param castaway The castaway to create
  * @throws if the castaway cannot be created
  * @throws if the season does not exist by that name
  * @throws if the tribe is not in the season
  * @returns The created castaway ID
  * @returnObj `{ newCastawayId }`
  */
export async function createCastawayLogic(
  seasonName: string,
  castaway: CastawayInsert
) {
  // Transaction to create the castaway
  return await db.transaction(async (trx) => {
    // Get the season ID
    const res = await trx
      .select({
        seasonId: seasonSchema.seasonId,
        tribeId: tribeSchema.tribeId
      })
      .from(tribeSchema)
      .innerJoin(seasonSchema, eq(seasonSchema.seasonId, tribeSchema.seasonId))
      .where(and(
        eq(seasonSchema.name, seasonName),
        eq(tribeSchema.tribeName, castaway.tribe)))
      .then((res) => res[0]);
    if (!res) throw new Error('Season or tribe not found');
    const { seasonId, tribeId } = res;
    if (!seasonId) throw new Error('Season not found');
    if (!tribeId) throw new Error('Tribe not found in season');


    const firstEpisodeId = await getEpisodes(seasonId)
      .then(episodes => episodes[0]?.episodeId);

    if (!firstEpisodeId) throw new Error('No episodes found for season');

    // Insert the castaway
    const newCastawayId = await trx
      .insert(castawaySchema)
      .values({
        ...castaway,
        seasonId,
      })
      .onConflictDoUpdate({
        target: [castawaySchema.fullName, castawaySchema.seasonId],
        set: {
          ...castaway
        }
      })
      .returning({ castawayId: castawaySchema.castawayId })
      .then((res) => res[0]?.castawayId);
    if (!newCastawayId) throw new Error('Failed to create castaway');

    // See if there is already a tribe update for this tribe
    const existingTribeUpdate = await trx
      .select({ baseEventId: baseEventSchema.baseEventId })
      .from(baseEventSchema)
      .innerJoin(baseEventReferenceSchema, eq(baseEventReferenceSchema.baseEventId, baseEventSchema.baseEventId))
      .innerJoin(episodeSchema, eq(episodeSchema.episodeId, baseEventSchema.episodeId))
      .where(and(
        eq(baseEventSchema.eventName, 'tribeUpdate'),
        eq(baseEventReferenceSchema.referenceType, 'Tribe'),
        eq(baseEventReferenceSchema.referenceId, tribeId),
        eq(episodeSchema.episodeId, firstEpisodeId)));

    if (existingTribeUpdate.length > 1) {
      throw new Error('Multiple tribe updates found for tribe in first episode.');
    }

    let tribeUpdateId: number | undefined;
    if (existingTribeUpdate.length === 0) {
      // Insert a tribe update for the castaway's tribe in the first episode
      tribeUpdateId = await trx
        .insert(baseEventSchema)
        .values({
          episodeId: firstEpisodeId,
          eventName: 'tribeUpdate',
          label: 'Initial Tribes',
          notes: ['Starting tribe assignment']
        })
        .returning({ baseEventId: baseEventSchema.baseEventId })
        .then((res) => res[0]?.baseEventId);
      if (!tribeUpdateId) throw new Error('Failed to create initial tribe update for castaway');
      await trx
        .insert(baseEventReferenceSchema)
        .values({
          baseEventId: tribeUpdateId,
          referenceType: 'Tribe',
          referenceId: tribeId,
        })
        .onConflictDoNothing();
    } else {
      tribeUpdateId = existingTribeUpdate[0]?.baseEventId;
    }
    if (!tribeUpdateId) throw new Error('Failed to get tribe update ID');

    // Link the castaway to the tribe update
    await trx
      .insert(baseEventReferenceSchema)
      .values({
        baseEventId: tribeUpdateId,
        referenceType: 'Castaway',
        referenceId: newCastawayId,
      })
      .onConflictDoNothing();

    // Invalidate caches
    revalidateTag(`castaways-${seasonId}`, 'max');
    revalidateTag('seasons', 'max');

    return { newCastawayId };
  });
}
