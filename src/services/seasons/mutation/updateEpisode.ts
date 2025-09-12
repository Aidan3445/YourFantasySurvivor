import 'server-only';

import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { episodeSchema } from '~/server/db/schema/episodes';
import { type EpisodeUpdate } from '~/types/episodes';
import { revalidateTag } from 'next/cache';

/**
  * Update an episode
  * @param episode The episode to create
  * @throws if the episode cannot be created
  * @throws if the season does not exist by that name
  * @returns The success status of the update
  * @returnObj `{ success }`
  */
export async function updateEpisodeLogic(
  episode: EpisodeUpdate
) {
  // Transaction to create the episode
  return await db.transaction(async (trx) => {
    // Insert the episode
    const update = await trx
      .update(episodeSchema)
      .set({
        ...episode,
        airDate: episode.airDate?.toUTCString(),
      })
      .where(eq(episodeSchema.episodeId, episode.episodeId))
      .returning({ seasonId: episodeSchema.seasonId })
      .then((res) => res[0]);

    if (!update) throw new Error('Failed to update episode');

    // Invalidate cache for the season's episodes
    revalidateTag(`episodes-${update.seasonId}`);

    return { success: true };
  });
}
