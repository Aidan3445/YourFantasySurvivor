'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import updateMemberDetailsLogic from '~/services/leagues/mutation/updateMemberDetails';
import { type LeagueMemberInsert } from '~/types/leagueMembers';

/**
 * Update league member details
 * @param leagueHash The hash of the league
 * @param member The member to update
 * @throws an error if the member cannot be updated
 * @returns Success status of the update
 * @returnObj `{ success }`
 */
export default async function updateMemberDetails(
  leagueHash: string,
  member: LeagueMemberInsert
) {
  try {
    return await requireLeagueMemberAuth(updateMemberDetailsLogic)(leagueHash, member);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not authenticated')) throw e;

    console.error('Failed to update member details', e);
    throw new Error('An error occurred while updating the member details.');
  }
}
