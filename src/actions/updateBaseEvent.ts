'use server';

import { requireSystemAdminAuth } from '~/lib/auth';
import updateBaseEventLogic from '~/services/seasons/mutation/updateBaseEvent';
import { type BaseEventInsert } from '~/types/events';

/**
  * Update a base event for the season
  * @param baseEventId id of the event to update
  * @param baseEvent updated event
  * @throws if the event cannot be updated
  * @returns the success status of the update
  * @returnObj `{ success }`
  */
export default async function updateBaseEvent(baseEventId: number, baseEvent: BaseEventInsert) {
  try {
    return await requireSystemAdminAuth(updateBaseEventLogic)(baseEventId, baseEvent);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not authorized')) throw e;

    console.error('Failed to create base event', e);
    throw new Error('Failed to create base event. Please try again.');
  }
}


