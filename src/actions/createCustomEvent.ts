'use server';

import { requireLeagueAdminAuth } from '~/lib/auth';
import createCustomEventLogic from '~/services/leagues/mutation/createCustomEvent';
import { type CustomEventInsert } from '~/types/events';

/**
  * Create a new custom/league event for the season
  * @param hash Hash of the league to create the event for
  * @param customEvent Event to create
  * @throws if the event cannot be created
  * @throws if the user is not an admin or owner of the league
  * @returns the id of the created event
  * @returnObj `{ newEventId }`
  */
export default async function createCustomEvent(
  hash: string,
  customEvent: CustomEventInsert
) {
  try {
    return await requireLeagueAdminAuth(createCustomEventLogic)(hash, customEvent);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to create league event', e);
    throw new Error('An error occurred while creating the league event.');
  }
}
