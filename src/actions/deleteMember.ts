'use server';

import { requireLeagueAdminAuth } from '~/lib/auth';
import deleteMemberLogic from '~/services/leagues/mutation/deleteMember';

/**
  * Delete league member
  * @param hash Hash of the league to delete the member from
  * @param memberId The ID of the member to delete
  * @throws an error if the member cannot be deleted
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function deleteMember(hash: string, memberId: number) {
  try {
    return await requireLeagueAdminAuth(deleteMemberLogic)(hash, memberId);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to update role', e);
    throw new Error('An error occurred while deleting the member.');
  }
}
