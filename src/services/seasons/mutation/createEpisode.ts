import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { episodeSchema } from '~/server/db/schema/episodes';
import { type Episode, type EpisodeInsert } from '~/types/episodes';
import { seasonSchema } from '~/server/db/schema/seasons';
import { revalidateTag } from 'next/cache';
import { scheduleEpisodeNotifications } from '~/services/notifications/reminders/episode';

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
  const result = await db.transaction(async (trx) => {
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

    const date = episode.airDate;

    // Insert the episode
    const newEpisode: Episode | null = await trx
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
      .returning()
      .then((res) => (res[0] ?
        {
          ...res[0],
          airDate: res[0]?.airDate ? new Date(`${res[0].airDate} Z`) : date,
          // air status isn't really used here so not calculating it perfectly
          airStatus: (res[0]?.airDate ? new Date(res[0].airDate) : date) > new Date() ? 'Upcoming' : 'Aired',
        } : null));

    if (!newEpisode) throw new Error('Failed to create episode');

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

    return {
      newEpisode,
      airDate: date,
      runtime: runtime ?? 90,
    };
  });


  const now = new Date();
  const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (result.newEpisode.airDate <= oneWeek) {
    void scheduleEpisodeNotifications(result.newEpisode);
  }

  return { newEpisodeId: result.newEpisode.episodeId };
}
