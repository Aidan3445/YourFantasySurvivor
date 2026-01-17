import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueSchema, leagueSettingsSchema } from '~/server/db/schema/leagues';
import getKeyEpisodes from '~/services/seasons/query/getKeyEpisodes';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { getActiveTimings } from '~/lib/episodes';

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
