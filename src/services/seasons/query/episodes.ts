import 'server-only';

import { db } from '~/server/db';
import { asc, eq } from 'drizzle-orm';
import { episodeSchema } from '~/server/db/schema/episodes';
import { type Episode, type AirStatus } from '~/types/episodes';
import { unstable_cache } from 'next/cache';

/**
  * Get the episodes for a season and caches the result
  * @param seasonId The season id
  * @returns the episodes starting from the next episode to air sorted by air date in descending order
  * @returnsObj `Episode[]`
  */
export default async function getEpisodes(seasonId: number) {
  return unstable_cache(
    async (seasonId: number) => fetchEpisodes(seasonId),
    ['episodes', seasonId.toString()],
    {
      revalidate: false,
      tags: [`episodes-${seasonId}`, 'episodes']
    }
  )(seasonId);
}

async function fetchEpisodes(seasonId: number) {
  const now = new Date();

  const episodes = await db
    .select()
    .from(episodeSchema)
    .where(eq(episodeSchema.seasonId, seasonId))
    .orderBy(asc(episodeSchema.airDate));

  const processedEpisodes = episodes.map(episode => {
    const airDate = new Date(`${episode.airDate} Z`);
    const endTime = new Date(airDate.getTime() + episode.runtime * 60 * 1000);

    let airStatus: AirStatus;
    if (now < airDate) {
      airStatus = 'Upcoming';
    } else if (now < endTime) {
      airStatus = 'Airing';
    } else {
      airStatus = 'Aired';
    }

    return {
      seasonId: episode.seasonId,
      episodeId: episode.episodeId,
      episodeNumber: episode.episodeNumber,
      title: episode.title,
      airDate,
      runtime: episode.runtime,
      airStatus,
      isMerge: episode.isMerge,
      isFinale: episode.isFinale,
    } as Episode;
  });

  return processedEpisodes;
}
