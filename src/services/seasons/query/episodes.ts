import 'server-only';

import { db } from '~/server/db';
import { asc, eq } from 'drizzle-orm';
import { episodeSchema } from '~/server/db/schema/episodes';
import { type Episode } from '~/types/episodes';
import { unstable_cache } from 'next/cache';
import { getAirStatus } from '~/lib/episodes';
import { type DBTransaction } from '~/types/server';

/**
  * Get the episodes for a season and caches the result
  * @param seasonId The season id
  * @param transactionOverride Optional transaction override
  * @returns the episodes starting from the next episode to air sorted by air date in descending order
  * @returnsObj `Episode[]`
  */
export default async function getEpisodes(
  seasonId: number,
  transactionOverride?: DBTransaction
) {
  return unstable_cache(
    async (seasonId: number) => fetchEpisodes(seasonId, transactionOverride),
    ['episodes', seasonId.toString()],
    {
      revalidate: 60, // 1 minute
      tags: [`episodes-${seasonId}`, 'episodes']
    }
  )(seasonId);
}

async function fetchEpisodes(seasonId: number, transactionOverride?: DBTransaction) {
  const episodes = await (transactionOverride ?? db)
    .select()
    .from(episodeSchema)
    .where(eq(episodeSchema.seasonId, seasonId))
    .orderBy(asc(episodeSchema.airDate));

  const processedEpisodes = episodes.map(episode => {
    const airDate = new Date(`${episode.airDate} Z`);
    const airStatus = getAirStatus(airDate, episode.runtime);

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
