'use server';

import { requireAuth } from '~/lib/auth';
import createNewLeagueLogic from '~/services/leagues/mutation/createNewLeague';
import { type NewLeagueMember } from '~/types/leagueMembers';

/**
 * Create a new league
 * @param userId The user creating the league
 * @param leagueName The league to create
 * @param newMember The new member to add
 * @param draftDate The draft date for the league
 * @throws an error if the league cannot be inserted
 * @throws an error if the league settings cannot be inserted
 * @throws an error if the user cannot be added as a member
 * @returns the league info of the league created
 * @returnObj `{ newLeagueHash }`
 */
export default async function createNewLeague(
  leagueName: string,
  newMember: NewLeagueMember,
  draftDate?: Date
) {
  try {
    return await requireAuth(createNewLeagueLogic)(leagueName, newMember, draftDate);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not authenticated')) throw e;

    console.error('Failed to create league', e);
    throw new Error('An error occurred while creating the league.');
  }
}
