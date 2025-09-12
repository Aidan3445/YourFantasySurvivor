'use server';

import { requireSystemAdminAuth } from '~/lib/auth';
import deleteBaseEventLogic from '~/services/seasons/mutation/deleteBaseEvent';

/**
  * Delete a base event for the season
  * @param baseEventId id of the event to delete
  * @throws if the event cannot be deleted
  * @throws if the user is not a system admin
  * @returns the success status of the delete
  * @returnObj `{ success }`
  */
export default async function deleteBaseEvent(baseEventId: number) {
  try {
    return await requireSystemAdminAuth(deleteBaseEventLogic)(baseEventId);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not authorized')) throw e;

    console.error('Failed to create base event', e);
    throw new Error('Failed to create base event.');
  }
}


