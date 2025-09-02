import 'server-only';

import getAllSeasons from '~/services/seasons/allSeasons';
import getCurrentSeasons from '~/services/seasons/currentSeasons';
import getCastaways from '~/services/seasons/castaways';
import getTribes from '~/services/seasons/tribes';
import getBaseEvents from '~/services/seasons/baseEvents';
import getEliminations from '~/services/seasons/eliminations';
import getTribesTimeline from '~/services/seasons/tribesTimeline';
import getEpisodes from '~/services/seasons/episodes';

/**
  * Get the season data for either all or active seasons
  * @param activeOnly Whether to get only active seasons or all seasons
  * @returns The season data
  * @returObj `castaways: Castaway[];
  *  season: Season
  *  tribes: Tribe[];
  *  baseEvents: Record<episodeNumber, Record<eventId, EventWithReferences>>
  *  episodes: Episode[];
  *  tribesTimeline: Record<episodeNumber, Record<tribeId, castawayId[]>>
  *  eliminations: Record<episodeNumber, Elimination[]>`
  */
export default async function getSeasonsData(activeOnly: boolean) {
  const seasons = activeOnly ? await getCurrentSeasons() : await getAllSeasons();
  if (seasons.length === 0) return [];

  const seasonsData = await Promise.all(seasons.map(async (season) => {
    const [castaways, tribes, baseEvents, episodes, tribesTimeline, eliminations] = await Promise.all([
      getCastaways(season.seasonId),
      getTribes(season.seasonId),
      getBaseEvents(season.seasonId),
      getEpisodes(season.seasonId, false),
      getTribesTimeline(season.seasonId),
      getEliminations(season.seasonId),
    ]);

    return {
      season: season,
      castaways,
      tribes,
      baseEvents,
      episodes,
      tribesTimeline,
      eliminations,
    };
  }));

  return seasonsData;
}
