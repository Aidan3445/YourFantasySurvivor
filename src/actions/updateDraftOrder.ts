'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import updateDraftOrderLogic from '~/services/leagues/mutation/updateDraftOrder';
import { type LeagueHash } from '~/types/deprecated/leagues';

/**
 * Update the draft order for a league
 * @param auth The authenticated league member
 * @param draftOrder The new draft order
 * @throws an error if the draft order cannot be updated
 * @returns Success status of the update
 * @returnObj `{ success }`
 */
export default async function updateDraftOrder(leagueHash: LeagueHash, draftOrder: number[]) {
  try {
    return await requireLeagueMemberAuth(updateDraftOrderLogic)(leagueHash, draftOrder);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to update draft order', e);
    throw new Error('An error occurred while updating the draft order.');
  }
}
