import getEpisodes from '~/services/seasons/query/episodes';
import type { KeyEpisodes } from '~/types/episodes';
import { calculateKeyEpisodes } from '~/lib/episodes';
import { type DBTransaction } from '~/types/server';

/**
  * Get the previous, next, and merge episodes for a season
  * @param seasonId The season ID
  * @param transactionOverride Optional transaction override
  * @returns the episodes
  * @returnObj `previousEpisode: Episode | null
  * nextEpisode: Episode | null
  * mergeEpisode: Episode | null`
  */

export default async function getKeyEpisodes(
  seasonId: number,
  transactionOverride?: DBTransaction
) {
  const episodes = await getEpisodes(seasonId, transactionOverride);
  return calculateKeyEpisodes(episodes) as KeyEpisodes;
}
