import 'server-only';

import getAllSeasons from '~/services/seasons/query/allSeasons';
import getCurrentSeasons from '~/services/seasons/query/currentSeasons';
import getCastaways from '~/services/seasons/query/castaways';
import getTribes from '~/services/seasons/query/tribes';
import getBaseEvents from '~/services/seasons/query/baseEvents';
import getEliminations from '~/services/seasons/query/eliminations';
import getTribesTimeline from '~/services/seasons/query/tribesTimeline';
import getEpisodes from '~/services/seasons/query/episodes';

/**
  * Get the season data for either all or active seasons
  * @param includeInactive Whether to include inactive seasons or not
  * @returns The season data
  * @returObj `castaways: Castaway[];
  *  season: Season
  *  castaways: Castaway[]
  *  tribes: Tribe[]
  *  baseEvents: Record<episodeNumber, Record<eventId, EventWithReferences>>
  *  episodes: Episode[]
  *  tribesTimeline: Record<episodeNumber, Record<tribeId, castawayId[]>>
  *  eliminations: Record<episodeNumber, Elimination[]>`
  */
export default async function getSeasonsData(includeInactive: boolean) {
  const seasons = includeInactive ? await getAllSeasons() : await getCurrentSeasons();
  if (seasons.length === 0) return [];

  return Promise.all(seasons.map(async (season) => {
    const [castaways, tribes, baseEvents, episodes, tribesTimeline, eliminations] = await Promise.all([
      getCastaways(season.seasonId),
      getTribes(season.seasonId),
      getBaseEvents(season.seasonId),
      getEpisodes(season.seasonId, false),
      getTribesTimeline(season.seasonId),
      getEliminations(season.seasonId),
    ]);

    return {
      season,
      castaways,
      tribes,
      baseEvents,
      episodes,
      tribesTimeline,
      eliminations,
    };
  }));
}
