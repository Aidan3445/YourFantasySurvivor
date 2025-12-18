import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueSchema, leagueSettingsSchema } from '~/server/db/schema/leagues';
import { type PredictionTiming } from '~/types/events';
import { type KeyEpisodes } from '~/types/episodes';
import { type LeagueStatus } from '~/types/leagues';
import getKeyEpisodes from '~/services/seasons/query/getKeyEpisodes';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
   * Get this weeks predictions for a league, episode, and member
   * @param auth The authenticated league member
   * @returns the prediction timings active for this week
   * @returnObj `PredictionTiming[]`
   */
export default async function getPredictionTimings(auth: VerifiedLeagueMemberAuth) {
  const league = await db
    .select({
      leagueStatus: leagueSchema.status,
      draftDate: leagueSettingsSchema.draftDate,
      startWeek: leagueSchema.startWeek,
      seasonId: leagueSchema.seasonId
    })
    .from(leagueSchema)
    .leftJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leagueSchema.leagueId))
    .where(eq(leagueSchema.leagueId, auth.leagueId))
    .then((leagues) => leagues[0]);

  if (!league || league.leagueStatus === 'Inactive') return [];

  const keyEpisodes = await getKeyEpisodes(league.seasonId);

  if (!keyEpisodes.nextEpisode) return [];

  return getActiveTimings({
    keyEpisodes,
    leagueStatus: league.leagueStatus,
    startWeek: league.startWeek,
  });

}

function getActiveTimings({
  keyEpisodes,
  leagueStatus,
  startWeek,
}: {
  keyEpisodes: KeyEpisodes
  leagueStatus: LeagueStatus,
  startWeek: number | null,
}) {
  const { previousEpisode, nextEpisode, mergeEpisode } = keyEpisodes;

  const timings: PredictionTiming[] = ['Weekly'];
  // Draft takes precedence if included in the list: 
  // - if the league is in draft status
  // - if there are no previous episodes
  // - if the draft date is after the last aired episode
  if (leagueStatus === 'Draft' || !previousEpisode || startWeek === nextEpisode?.episodeNumber) {
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
  if (previousEpisode?.isMerge) {
    timings.push('After Merge');
  }

  // Before finale only if included in the list and next episode is the finale
  if (nextEpisode?.isFinale) {
    timings.push('Before Finale');
  }

  return timings;
}


