import 'server-only';

import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { episodeSchema } from '~/server/db/schema/episodes';
import { type EpisodeInsert } from '~/types/episodes';
import { seasonSchema } from '~/server/db/schema/seasons';
import { revalidateTag } from 'next/cache';

/**
  * Create a new episode
  * @param seasonName The season name to create the episode in
  * @param episode The episode to create
  * @throws if the episode cannot be created
  * @throws if the season does not exist by that name
  * @returns The created episode ID
  * @returnObj `{ newEpisodeId }`
  */
export async function createEpisodeLogic(
  seasonName: string,
  episode: EpisodeInsert
) {
  // Transaction to create the episode
  return await db.transaction(async (trx) => {
    // Get the season ID
    const season = await trx
      .select({ seasonId: seasonSchema.seasonId })
      .from(seasonSchema)
      .where(eq(seasonSchema.name, seasonName))
      .then((res) => res[0]);
    if (!season) throw new Error('Season not found');

    // Guess the runtime
    let runtime;
    if (episode.episodeNumber === 1 || episode.isFinale) {
      runtime = 120;
    }

    // Insert the episode
    const newEpisodeId = await trx
      .insert(episodeSchema)
      .values({
        ...episode,
        airDate: episode.airDate.toUTCString(),
        seasonId: season.seasonId,
        runtime
      })
      .returning({ episodeId: episodeSchema.episodeId })
      .then((res) => res[0]?.episodeId);
    if (!newEpisodeId) throw new Error('Failed to create episode');

    // Invalidate cache for the season's episodes
    revalidateTag(`episodes-${season.seasonId}`);

    return { newEpisodeId };
  });
}
