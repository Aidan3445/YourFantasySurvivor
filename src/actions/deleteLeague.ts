'use server';

import { requireLeagueOwnerAuth } from '~/lib/auth';
import deleteLeagueLogic from '~/services/leagues/mutation/deleteLeague';

/**
  * Delete a league
  * @param hash The hash of the league to delete
  * @throws an error if the user is not authorized
  * @throws an error if the league cannot be deleted
  * @returns Success status of the deletion
  * @returnObj `{ success }`
  */
export default async function deleteLeague(hash: string) {
  try {
    return await requireLeagueOwnerAuth(deleteLeagueLogic)(hash);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to delete league', e);
    throw new Error('An error occurred while deleting the league.');
  }
}
