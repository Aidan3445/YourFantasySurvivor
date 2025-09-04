'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import updateAdminsLogic from '~/services/leagues/mutation/updateAdmins';
import { type LeagueHash } from '~/types/deprecated/leagues';

/**
  * Update league admin list
  * @param leagueHash Hash of the league to update the admins for
  * @param admins The new list of admins
  * @throws an error if the admins cannot be updated
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function updateAdmins(leagueHash: LeagueHash, admins: number[]) {
  try {
    return await requireLeagueMemberAuth(updateAdminsLogic)(leagueHash, admins);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to update admins', e);
    throw new Error('An error occurred while updating the admins.');
  }
}
