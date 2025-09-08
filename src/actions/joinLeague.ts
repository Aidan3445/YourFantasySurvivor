'use server';

import { requireAuth } from '~/lib/auth';
import joinLeagueLogic from '~/services/leagues/mutation/joinLeague';
import { type NewLeagueMember } from '~/types/deprecated/leagueMembers';

/**
  * Join a league
  * @param hash The hash of the league
  * @param newMember The new member to add
  * @throws an error if the league cannot be found
  * @throws an error if the user is already a member of the league
  * @throws an error if the user cannot be added as a member
  * @throws an error if the league is not in the predraft status
  * @throws an error if the user is not authenticated
  * @returns an object indicating success
  * @returnObj `{ success: true }`
  */
export default async function joinLeague(
  hash: string,
  newMember: NewLeagueMember
) {
  try {
    return await requireAuth(joinLeagueLogic)(hash, newMember);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not authenticated')) throw e;

    console.error('Failed to join league', e);
    throw new Error('An error occurred while joining the league.');
  }
}
