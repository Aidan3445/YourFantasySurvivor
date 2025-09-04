'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import updateLeagueStatusLogic from '~/services/leagues/mutation/updateLeagueStatus';

/**
  * Update the league settings
  * Predraft -> Draft -> Active -> Inactive
  * @param auth The authenticated league member
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function updateLeagueStatus(
  leagueHash: string,
) {
  try {
    return await requireLeagueMemberAuth(updateLeagueStatusLogic)(leagueHash);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to update league settings', e);
    throw new Error('An error occurred while updating the league settings.');
  }
}
