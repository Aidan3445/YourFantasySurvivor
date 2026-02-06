'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import deleteMemberLogic from '~/services/leagues/mutation/deleteMember';

/**
  * Leave the league
  * @param hash Hash of the league to leave
  * @throws an error if the league cannot be left
  * @returns Success status of the removal
  * @returnObj `{ success }`
  */
export default async function leaveLeague(hash: string, memberId: number) {
  try {
    return await requireLeagueMemberAuth(deleteMemberLogic)(hash, memberId);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to update role', e);
    throw new Error('An error occurred while leaving the league.');
  }
}
