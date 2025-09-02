import 'server-only';

import { db } from '~/server/db';
import { and, asc, eq, lte } from 'drizzle-orm';
import { episodeSchema } from '~/server/db/schema/episodes';
import { type Episode, type AirStatus } from '~/types/episodes';

/**
  * Get the next episode to air for the league's season
  * @param seasonId - the season id
  * @param mostRecentOnly - if true, returns only the most recent episode to air
  * @returns the episodes starting from the next episode to air sorted by air date in descending order
  * @returnsObj `Episode[]`
  */
export default async function getEpisodes(seasonId: number, mostRecentOnly: boolean) {
  const now = new Date();

  const episodes = await db
    .select()
    .from(episodeSchema)
    .where(and(
      eq(episodeSchema.seasonId, seasonId),
      mostRecentOnly ? lte(episodeSchema.airDate, now.toISOString()) : undefined
    ))
    .orderBy(asc(episodeSchema.airDate));

  const processedEpisodes = (mostRecentOnly ? episodes.slice(-1) : episodes)
    .map(episode => {
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
