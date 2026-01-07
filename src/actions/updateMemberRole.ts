'use server';

import { requireLeagueOwnerAuth } from '~/lib/auth';
import updateRoleLogic from '~/services/leagues/mutation/updateMemberRole';
import { type LeagueMemberRole } from '~/types/leagueMembers';

/**
  * Update league member role
  * @param hash Hash of the league to update the admins for
  * @param memberId The ID of the member to update
  * @param newRole The new role to assign to the member
  * @throws an error if the role cannot be updated
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function updateMemberRole(hash: string, memberId: number, newRole: LeagueMemberRole) {
  try {
    return await requireLeagueOwnerAuth(updateRoleLogic)(hash, memberId, newRole);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to update role', e);
    throw new Error('An error occurred while updating the member role.');
  }
}
