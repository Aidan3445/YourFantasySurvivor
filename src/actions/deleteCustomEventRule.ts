'use server';

import { requireLeagueAdminAuth } from '~/lib/auth';
import deleteCustomEventRuleLogic from '~/services/leagues/mutation/deleteCustomEventRule';

/**
 * Delete a league event rule
 * @param auth The authenticated league member
 * @param leagueHash The hash of the league
 * @param eventName The event name of the rule to delete
 * @throws an error if the user is not authorized
 * @throws an error if the rule cannot be deleted
 * @returns Success status of the deletion
 * @returnObj `{ success }`
 */
export default async function deleteCustomEventRule(
  leagueHash: string,
  eventId: number
) {
  try {
    return await requireLeagueAdminAuth(deleteCustomEventRuleLogic)(leagueHash, eventId);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to delete league event rule', e);
    throw new Error('An error occurred while deleting the league event rule.');
  }
}
