'use server';

import { eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { EliminationEventNames } from '~/lib/events';
import { db } from '~/server/db';
import { baseEventSchema } from '~/server/db/schema/baseEvents';

/**
  * Delete a base event for the season
  * @param baseEventId id of the event to delete
  * @throws if the event cannot be deleted
  * @returns the success status of the delete
  * @returnObj `{ success }`
  */
export default async function deleteBaseEventLogic(baseEventId: number) {
  // Cascade delete handles references automatically
  const result = await db
    .delete(baseEventSchema)
    .where(eq(baseEventSchema.baseEventId, baseEventId))
    .returning({
      id: baseEventSchema.baseEventId,
      eventName: baseEventSchema.eventName
    });

  if (!result.length) {
    throw new Error('Event not found');
  }

  if (['tribeUpdate', ...EliminationEventNames].includes(result[0]!.eventName)) {
    // Invalidate cache
    revalidateTag('tribe-members');
  }

  return { success: true };
}
