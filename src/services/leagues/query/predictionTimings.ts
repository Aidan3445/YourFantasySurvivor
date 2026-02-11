import 'server-only';

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
  if (auth.status === 'Inactive') return [];

  const keyEpisodes = await getKeyEpisodes(auth.seasonId);

  if (!keyEpisodes.nextEpisode) return [];

  return getActiveTimings({
    keyEpisodes,
    leagueStatus: auth.status,
    startWeek: auth.startWeek,
  });

}
