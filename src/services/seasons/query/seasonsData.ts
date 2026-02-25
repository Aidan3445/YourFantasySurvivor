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
    const tribeId = startTribeIds ? Number(startTribeIds[0]) : null;
    const tribeMatch = tribeId !== null ? tribes.find(t => t.tribeId === tribeId) ?? null : null;
    const tribe = tribeMatch ? { name: tribeMatch.tribeName, color: tribeMatch.tribeColor } : null;

    // Find all elimination episodes for this castaway
    const elimEpisodes = eliminations
      .map((epElims, idx) => epElims?.some(e => e.castawayId === castaway.castawayId) ? idx : -1)
      .filter(idx => idx >= 0);

    // Find redemption events from baseEvents that reference this castaway
    const reentryEpisodes = Object.entries(baseEvents)
      .flatMap(([epStr, events]) =>
        Object.values(events)
          .filter(e =>
            e.eventName === 'redemption' &&
            e.references.some(r => r.type === 'Castaway' && r.id === castaway.castawayId))
          .map(() => Number(epStr)))
      .sort((a, b) => a - b);

    // Build redemption history
    const redemption = reentryEpisodes.map(reentryEp => {
      const nextElim = elimEpisodes.find(ep => ep > reentryEp) ?? null;
      return { reentryEpisode: reentryEp, secondEliminationEpisode: nextElim };
    });

    // Currently active if last redemption is after last elimination
    const eliminatedEpisode = elimEpisodes[0] ?? null;

    return {
      ...castaway,
      tribe,
      eliminatedEpisode,
      ...(redemption.length > 0 ? { redemption } : {}),
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
