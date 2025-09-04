'use server';

import { requireLeagueAdminAuth } from '~/lib/auth';
import updateCustomEventLogic from '~/services/leagues/mutation/updateCustomEvent';
import { type CustomEventInsert } from '~/types/events';

/**
  * Update a base event for the season
  * @param leagueHash Hash of the league to update the event for
  * @param customEventId ID of the event to update
  * @param customEvent Event to update
  * @throws if the user is not a system admin
  * @throws if the event cannot be updated
  */
export default async function updateCustomEvent(
  leagueHash: string,
  customEventId: number,
  customEvent: CustomEventInsert
) {
  try {
    return await requireLeagueAdminAuth(updateCustomEventLogic)(leagueHash, customEventId, customEvent);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to update league event', e);
    throw new Error('An error occurred while updating the league event.');
  }
}
