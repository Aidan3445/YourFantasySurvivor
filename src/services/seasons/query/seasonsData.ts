import 'server-only';

import getAllSeasons from '~/services/seasons/query/allSeasons';
import getCurrentSeasons from '~/services/seasons/query/currentSeasons';
import getCastaways from '~/services/seasons/query/castaways';
import getTribes from '~/services/seasons/query/tribes';
import getBaseEvents from '~/services/seasons/query/baseEvents';
import getEliminations from '~/services/seasons/query/eliminations';
import getTribesTimeline from '~/services/seasons/query/tribesTimeline';
import getEpisodes from '~/services/seasons/query/episodes';
import { type Season, type SeasonsDataQuery } from '~/types/seasons';
import { type EnrichedCastaway } from '~/types/castaways';
import getKeyEpisodes from '~/services/seasons/query/getKeyEpisodes';
import { seasonSchema } from '~/server/db/schema/seasons';
import { db } from '~/server/db';
import { eq } from 'drizzle-orm';

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
    const datedSeason = {
      ...season,
      premiereDate: typeof season.premiereDate === 'string'
        ? new Date(`${season.premiereDate as string}`)
        : season.premiereDate,
      finaleDate: season.finaleDate
        ? (typeof season.finaleDate === 'string'
          ? new Date(`${season.finaleDate as string}`)
          : season.finaleDate)
        : null
    } as Season;
    return await getSeasonData(season.seasonId, datedSeason);
  }));
}

/**
  * Get the necessary season data for a single season
  * @param seasonId The season ID to get the data for
  * @param season optional season object to avoid refetching
  * @returns The season data
  * @returObj `SeasonsDataQuery | null`
  */
export async function getSeasonData(seasonId: number, season?: Season) {
  const [
    castaways, tribes, baseEvents, episodes,
    tribesTimeline, eliminations, keyEpisodes,
    fetchedSeason
  ] = await Promise.all([
    getCastaways(seasonId),
    getTribes(seasonId),
    getBaseEvents(seasonId),
    getEpisodes(seasonId),
    getTribesTimeline(seasonId),
    getEliminations(seasonId),
    getKeyEpisodes(seasonId),
    season ? Promise.resolve(season) : db
      .select()
      .from(seasonSchema)
      .where(eq(seasonSchema.seasonId, seasonId))
      .then(rows => rows[0] ? {
        ...rows[0],
        premiereDate: new Date(`${rows[0].premiereDate} Z`),
        finaleDate: rows[0].finaleDate ? new Date(`${rows[0].finaleDate} Z`) : null
      } as Season : null)
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
    season: fetchedSeason,
    castaways: enrichedCastaways,
    tribes,
    baseEvents,
    episodes,
    tribesTimeline,
    eliminations,
    keyEpisodes
  } as SeasonsDataQuery;
}
