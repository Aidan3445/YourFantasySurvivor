import 'server-only';

import { db } from '~/server/db';
import { and, desc, eq, gt, lte } from 'drizzle-orm';
import { leagueSchema, leagueSettingsSchema } from '~/server/db/schema/leagues';
import { episodeSchema } from '~/server/db/schema/episodes';
import { type PredictionTiming } from '~/types/events';
import { type Episode } from '~/types/episodes';
import { type LeagueStatus } from '~/types/leagues';

/**
   * Get this weeks predictions for a league, episode, and member
   * @param hash The hash of the league
   * @returns the prediction timings active for this week
   * @returnObj `PredictionTiming[]`
   */
export default async function getPredictionTimings(hash: string) {
  const league = await db
    .select({
      leagueStatus: leagueSchema.status,
      draftDate: leagueSettingsSchema.draftDate,
      seasonId: leagueSchema.season
    })
    .from(leagueSchema)
    .leftJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leagueSchema.leagueId))
    .where(eq(leagueSchema.hash, hash))
    .then((leagues) => leagues[0]);

  if (!league) return [];

  const { currentEpisode, nextEpisode, mergeEpisode } = await getSeasonEpisodes(league.seasonId);

  if (!nextEpisode) return [];

  return getActiveTimings({
    lastEpisode: currentEpisode,
    mergeEpisode,
    nextEpisode,
    leagueStatus: league.leagueStatus,
    draftDate: league.draftDate ? new Date(`${league.draftDate} Z`) : null,
  });

}

/**
  * Get the current, next, and merge episodes for a season
  * @param seasonId The season ID
  * @returns the episodes
  * @returnObj `currentEpisode: Episode | null
  * nextEpisode: Episode | null
  * mergeEpisode: Episode | null`
  */
async function getSeasonEpisodes(seasonId: number) {
  // Get current episode status
  const now = new Date();
  const currentEpisodeReq = db
    .select({
      episodeId: episodeSchema.episodeId,
      airDate: episodeSchema.airDate
    })
    .from(episodeSchema)
    .where(and(
      eq(episodeSchema.seasonId, seasonId),
      lte(episodeSchema.airDate, now.toISOString())
    ))
    .orderBy(desc(episodeSchema.episodeNumber))
    .limit(1)
    .then(res => res[0]);

  const nextEpisodeReq = db
    .select({
      episodeId: episodeSchema.episodeId,
      airDate: episodeSchema.airDate
    })
    .from(episodeSchema)
    .where(and(
      eq(episodeSchema.seasonId, seasonId),
      gt(episodeSchema.airDate, now.toISOString())
    ))
    .orderBy(episodeSchema.episodeNumber)
    .limit(1)
    .then(res => res[0]);

  // Only fetch merge episode if needed for timing
  const mergeEpisodeReq = db
    .select({
      episodeId: episodeSchema.episodeId,
      airDate: episodeSchema.airDate,
      isMerge: episodeSchema.isMerge,
      isFinale: episodeSchema.isFinale,
    })
    .from(episodeSchema)
    .where(and(
      eq(episodeSchema.seasonId, seasonId),
      eq(episodeSchema.isMerge, true)
    ))
    .limit(1)
    .then(res => res[0]);

  const [currentEpisode, nextEpisode, mergeEpisode] = await Promise.all([
    currentEpisodeReq, nextEpisodeReq, mergeEpisodeReq
  ]);

  return {
    currentEpisode: currentEpisode ? {
      ...currentEpisode,
      airDate: new Date(`${currentEpisode.airDate} Z`)
    } as Episode : null,
    nextEpisode: nextEpisode ? {
      ...nextEpisode,
      airDate: new Date(`${nextEpisode.airDate} Z`)
    } as Episode : null,
    mergeEpisode: mergeEpisode ? {
      ...mergeEpisode,
      airDate: new Date(`${mergeEpisode.airDate} Z`)
    } as Episode : null,
  };
}

function getActiveTimings({
  lastEpisode,
  mergeEpisode,
  nextEpisode,
  leagueStatus,
  draftDate,
}: {
  lastEpisode: Episode | null,
  mergeEpisode: Episode | null,
  nextEpisode: Episode | null,
  leagueStatus: LeagueStatus,
  draftDate: Date | null,
}) {
  const timings: PredictionTiming[] = ['Weekly'];
  // Draft takes precedence if included in the list: 
  // - if the league is in draft status
  // - if there are no previous episodes
  // - if the draft date is after the last aired episode
  if (leagueStatus === 'Draft' || !lastEpisode || (draftDate && draftDate > lastEpisode.airDate)) {
    timings.push('Draft');
  }

  // Weekly premerge only if included in the list and no merge episode
  if (!mergeEpisode) {
    timings.push('Weekly (Premerge only)');
  }

  // Weekly postmerge only if included in the list and merge episode exists
  if (mergeEpisode) {
    timings.push('Weekly (Postmerge only)');
  }

  // After merge only if included in the list and merge episode is last aired
  if (lastEpisode?.isMerge) {
    timings.push('After Merge');
  }

  // Before finale only if included in the list and next episode is the finale
  if (nextEpisode?.isFinale) {
    timings.push('Before Finale');
  }

  return timings;
}


