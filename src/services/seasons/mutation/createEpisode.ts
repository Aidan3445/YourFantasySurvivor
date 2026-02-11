import 'server-only';
import { eq, and, lt, desc } from 'drizzle-orm';
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
          airDate: new Date(res[0]?.airDate ?? 0),
          // air status isn't really used here so not calculating it perfectly
          airStatus: new Date(res[0]?.airDate ?? 0) > new Date() ? 'Upcoming' : 'Aired',
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

    // Get previous episode's air date for mid-week reminder timing
    const previousEpisode = await trx
      .select({ airDate: episodeSchema.airDate })
      .from(episodeSchema)
      .where(and(
        eq(episodeSchema.seasonId, season.seasonId),
        lt(episodeSchema.episodeNumber, episode.episodeNumber)
      ))
      .orderBy(desc(episodeSchema.episodeNumber))
      .limit(1)
      .then((res) => res[0]);

    // Invalidate cache for the season's episodes
    revalidateTag(`episodes-${season.seasonId}`, 'max');

    return {
      newEpisode,
      airDate: date,
      runtime: runtime ?? 90,
      previousEpisodeAirDate: previousEpisode?.airDate
        ? new Date(previousEpisode.airDate)
        : undefined,
    };
  });

  // Schedule notifications outside transaction
  void scheduleEpisodeNotifications(
    result.newEpisode,
    result.previousEpisodeAirDate,
  );

  return { newEpisodeId: result.newEpisode.episodeId };
}
