'use server';

import { requireLeagueAdminAuth } from '~/lib/auth';
import deleteCustomEventLogic from '~/services/leagues/mutation/deleteCustomEvent';

/**
  * Delete a base event for the season
  * @param leagueHash Hash of the league to delete the event from
  * @param customEventId Event ID to delete
  * @throws if the user is not an admin or owner of the league
  * @throws if the event cannot be deleted
  * @returns success status
  * @retunObj `{ success: boolean }`
  */
export default async function deleteCustomEvent(
  leagueHash: string,
  customEventId: number
) {
  try {
    return await requireLeagueAdminAuth(deleteCustomEventLogic)(leagueHash, customEventId);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not authenticated') || message.includes('Not a league member')) throw e;

    console.error('Failed to delete league event', e);
    throw new Error('An error occurred while deleting the league event.');
  }
}
