'use server';

import { requireAuth } from '~/lib/auth';
import createNewLeagueLogic from '~/services/leagues/mutation/createNewLeague';
import { type LeagueMemberInsert } from '~/types/leagueMembers';

/**
  * Create a new league
  * @param leagueName The league to create
  * @param newMember The new member to add
  * @param draftDate The draft date for the league
  * @param isProtected Whether the league is protected
  * @throws an error if the league cannot be inserted
  * @throws an error if the league settings cannot be inserted
  * @throws an error if the user cannot be added as a member
  * @throws an error if the user is not authenticated
  * @returns the league hash of the league created, its ID, and the member ID of the owner
  * @returnObj `{ newHash, leagueId, memberId }`
  */
export default async function createNewLeague(
  leagueName: string,
  newMember: LeagueMemberInsert,
  draftDate?: Date,
  isProtected?: boolean,
) {
  try {
    return await requireAuth(createNewLeagueLogic)(leagueName, newMember, draftDate, isProtected);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not authenticated')) throw e;

    console.error('Failed to create league', e);
    throw new Error('An error occurred while creating the league.');
  }
}
