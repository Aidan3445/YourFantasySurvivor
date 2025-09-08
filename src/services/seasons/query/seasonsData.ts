import 'server-only';

import getAllSeasons from '~/services/seasons/query/allSeasons';
import getCurrentSeasons from '~/services/seasons/query/currentSeasons';
import getCastaways from '~/services/seasons/query/castaways';
import getTribes from '~/services/seasons/query/tribes';
import getBaseEvents from '~/services/seasons/query/baseEvents';
import getEliminations from '~/services/seasons/query/eliminations';
import getTribesTimeline from '~/services/seasons/query/tribesTimeline';
import getEpisodes from '~/services/seasons/query/episodes';
import { type SeasonsDataQuery } from '~/types/seasons';
import { type EnrichedCastaway } from '~/types/castaways';

/**
  * Get the season data for either all or active seasons
  * @param includeInactive Whether to include inactive seasons or not
  * @returns The season data
  * @returObj `SeasonsDataQuery[]`
  */
export default async function getSeasonsData(includeInactive: boolean) {
  const seasons = includeInactive ? await getAllSeasons() : await getCurrentSeasons();
  if (seasons.length === 0) return [];

  return Promise.all(seasons.map(async (season) => {
    const [castaways, tribes, baseEvents, episodes, tribesTimeline, eliminations] = await Promise.all([
      getCastaways(season.seasonId),
      getTribes(season.seasonId),
      getBaseEvents(season.seasonId),
      getEpisodes(season.seasonId),
      getTribesTimeline(season.seasonId),
      getEliminations(season.seasonId),
    ]);

    const enrichedCastaways: EnrichedCastaway[] = castaways.map(castaway => {
      const startTribeIds = Object.entries(tribesTimeline[1] ?? {})
        .find(([_, castawayIds]) => castawayIds.includes(castaway.castawayId));

      if (!startTribeIds) return { ...castaway, tribe: null, eliminatedEpisode: null };

      const tribeId = Number(startTribeIds[0]);
      const tribeMatch = tribes.find(t => t.tribeId === tribeId) ?? null;
      const tribe = tribeMatch ? { name: tribeMatch.tribeName, color: tribeMatch.tribeColor } : null;

      const eliminatedEpisodeIndex = eliminations.findIndex(episodeElims =>
        episodeElims?.some(elim => elim.castawayId === castaway.castawayId)
      );

      return {
        ...castaway,
        tribe,
        eliminatedEpisode: eliminatedEpisodeIndex >= 0 ? eliminatedEpisodeIndex + 1 : null
      };
    });

    return {
      season,
      castaways: enrichedCastaways,
      tribes,
      baseEvents,
      episodes,
      tribesTimeline,
      eliminations,
    } as SeasonsDataQuery;
  }));
}
