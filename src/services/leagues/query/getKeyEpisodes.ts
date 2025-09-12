import getEpisodes from '~/services/seasons/query/episodes';
import type { KeyEpisodes } from '~/types/episodes';

/**
  * Get the previous, next, and merge episodes for a season
  * @param seasonId The season ID
  * @returns the episodes
  * @returnObj `previousEpisode: Episode | null
  * nextEpisode: Episode | null
  * mergeEpisode: Episode | null`
  */

export default async function getKeyEpisodes(seasonId: number) {
  // Get previous episode status
  const episodes = await getEpisodes(seasonId);

  return episodes.reduce((acc, episode) => {
    if (episode.airStatus === 'Aired') {
      acc.previousEpisode = episode;
    } else if (episode.airStatus === 'Upcoming' && !acc.nextEpisode) {
      acc.nextEpisode = episode;
    } else if (episode.isMerge) {
      acc.mergeEpisode = episode;
    }
    return acc;
  }, {
    previousEpisode: null,
    nextEpisode: null,
    mergeEpisode: null,
  } as KeyEpisodes);
}
