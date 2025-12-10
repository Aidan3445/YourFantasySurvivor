import 'server-only';

import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { episodeSchema } from '~/server/db/schema/episodes';
import { type EpisodeInsert } from '~/types/episodes';
import { seasonSchema } from '~/server/db/schema/seasons';
import { revalidateTag } from 'next/cache';
import { setToNY8PM } from '~/lib/utils';

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
    let runtime = episode.runtime;
    if (!runtime && (episode.episodeNumber === 1 || episode.isFinale)) {
      runtime = 120;
    }

    const date = setToNY8PM(episode.airDate);

    // Insert the episode
    const newEpisodeId = await trx
      .insert(episodeSchema)
      .values({
        ...episode,
        airDate: date.toISOString(),
        seasonId: season.seasonId,
        runtime
      })
      .onConflictDoUpdate({
        target: [episodeSchema.episodeNumber, episodeSchema.seasonId],
        set: {
          ...episode,
          airDate: date.toISOString(),
        }
      })
      .returning({ episodeId: episodeSchema.episodeId })
      .then((res) => res[0]?.episodeId);
    if (!newEpisodeId) throw new Error('Failed to create episode');

    if (episode.episodeNumber === 1) {
      // Update the premiere date of the season
      await trx
        .update(seasonSchema)
        .set({ premiereDate: date.toISOString() })
        .where(eq(seasonSchema.seasonId, season.seasonId));
      // Invalidate seasons
      revalidateTag('seasons', 'max');
    }

    if (episode.isFinale) {
      // Update the finale date of the season
      await trx
        .update(seasonSchema)
        .set({ finaleDate: date.toISOString() })
        .where(eq(seasonSchema.seasonId, season.seasonId));
      // Invalidate seasons
      revalidateTag('seasons', 'max');
    }

    // Invalidate cache for the season's episodes
    revalidateTag(`episodes-${season.seasonId}`, 'max');

    return { newEpisodeId };
  });
}
