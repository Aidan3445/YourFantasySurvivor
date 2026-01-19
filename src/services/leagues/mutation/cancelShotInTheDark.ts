import 'server-only';

import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import { shotInTheDarkSchema } from '~/server/db/schema/leagueMembers';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import getKeyEpisodes from '~/services/seasons/query/getKeyEpisodes';

/**
  * Cancel shot in the dark activation
  * @param auth The authenticated league member
  * @throws an error if the shot in the dark cannot be cancelled
  * @returns an object indicating success
  * @returnObj `{ success: boolean }`
  */
export default async function cancelShotInTheDarkLogic(
  auth: VerifiedLeagueMemberAuth,
) {
  if (auth.status === 'Inactive') throw new Error('League is inactive');

  return await db.transaction(async (trx) => {
    const { previousEpisode, nextEpisode } = await getKeyEpisodes(auth.seasonId, trx);

    if (previousEpisode?.airStatus === 'Airing') {
      throw new Error('Cannot cancel Shot in the Dark while an episode is airing');
    }

    if (!nextEpisode) {
      throw new Error('No upcoming episode found');
    }

    // Delete the activation for the next episode
    const deleted = await trx
      .delete(shotInTheDarkSchema)
      .where(and(
        eq(shotInTheDarkSchema.memberId, auth.memberId),
        eq(shotInTheDarkSchema.episodeId, nextEpisode.episodeId)
      ))
      .returning({ episodeId: shotInTheDarkSchema.episodeId })
      .then(rows => rows[0]);

    if (!deleted) {
      throw new Error('No Shot in the Dark activation found to cancel');
    }

    return { success: true };
  });
}
