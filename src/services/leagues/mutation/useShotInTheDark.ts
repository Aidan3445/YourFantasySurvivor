import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { shotInTheDarkSchema } from '~/server/db/schema/leagueMembers';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import getKeyEpisodes from '~/services/seasons/query/getKeyEpisodes';
import getLeagueSettings from '~/services/leagues/query/settings';

/**
  * Activate shot in the dark for the upcoming episode
  * @param auth The authenticated league member
  * @throws an error if the shot in the dark cannot be activated
  * @returns an object indicating success
  * @returnObj `{ success: boolean }`
  */
export default async function playShotInTheDarkLogic(
  auth: VerifiedLeagueMemberAuth,
) {
  if (auth.status === 'Inactive') throw new Error('League is inactive');

  const settings = await getLeagueSettings(auth);

  if (!settings?.shotInTheDarkEnabled) {
    throw new Error('Shot in the Dark is not enabled for this league');
  }

  return await db.transaction(async (trx) => {
    const { previousEpisode, nextEpisode } = await getKeyEpisodes(auth.seasonId, trx);

    if (previousEpisode?.airStatus === 'Airing') {
      throw new Error('Cannot activate Shot in the Dark while an episode is airing');
    }

    if (!nextEpisode) {
      console.error('No upcoming episode found for shot in the dark', {
        previousEpisode,
        nextEpisode,
      });
      throw new Error('No upcoming episode found to activate Shot in the Dark for');
    }

    // Check if already used this season
    const existingUse = await trx
      .select()
      .from(shotInTheDarkSchema)
      .where(eq(shotInTheDarkSchema.memberId, auth.memberId))
      .then(rows => rows[0]);

    if (existingUse) {
      throw new Error('You have already used your Shot in the Dark this season');
    }

    // Insert activation
    await trx
      .insert(shotInTheDarkSchema)
      .values({
        memberId: auth.memberId,
        episodeId: nextEpisode.episodeId,
      });

    return { success: true };
  });
}
