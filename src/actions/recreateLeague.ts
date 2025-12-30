'use server';

import { requireLeagueOwnerAuth } from '~/lib/auth';
import recreateLeagueLogic from '~/services/leagues/mutation/recreateLeague';

/**
  * Recreate a league by copying its settings and adding specified members
  * @param leagueHash - the hash of the league to recreate
  * @param memberIds - array of member IDs to add to the new league in new draft order
  * @throws an error if the original league cannot be found
  * @throws an error if any member cannot be added
  * @returns the league hash of the recreated league
  * @returnObj `{ newHash }`
  */
export default async function recreateLeague(
  leagueHash: string,
  memberIds: number[]
) {
  try {
    return await requireLeagueOwnerAuth(recreateLeagueLogic)(leagueHash, memberIds);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not authenticated')) throw e;

    console.error('Failed to create league', e);
    throw new Error('An error occurred while creating the league.');
  }
}
