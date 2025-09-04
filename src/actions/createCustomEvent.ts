'use server';

import { requireLeagueAdminAuth } from '~/lib/auth';
import createCustomEventLogic from '~/services/leagues/mutation/createCustomEvent';
import { type CustomEventInsert } from '~/types/events';

/**
 * Create a new custom/league event for the season
 * @param leagueHash - hash of the league to create the event for
 * @param customEvent - event to create
 * @throws if the user is not a system admin
 * @throws if the event cannot be created
 */
export default async function createCustomEvent(
  leagueHash: string,
  customEvent: CustomEventInsert
) {
  try {
    return await requireLeagueAdminAuth(createCustomEventLogic)(leagueHash, customEvent);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to create league event', e);
    throw new Error('An error occurred while creating the league event.');
  }
}
