import getEpisodes from '~/services/seasons/query/episodes';
import type { KeyEpisodes } from '~/types/episodes';
import { calculateKeyEpisodes } from '~/lib/episodes';

/**
  * Get the previous, next, and merge episodes for a season
  * @param seasonId The season ID
  * @returns the episodes
  * @returnObj `previousEpisode: Episode | null
  * nextEpisode: Episode | null
  * mergeEpisode: Episode | null`
  */

export default async function getKeyEpisodes(seasonId: number) {
  const episodes = await getEpisodes(seasonId);
  return calculateKeyEpisodes(episodes) as KeyEpisodes;
}
