'use server';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { baseEventReferenceSchema, baseEventSchema } from '~/server/db/schema/baseEvents';
import { type BaseEventInsert } from '~/types/events';

/**
  * Update a base event for the season
  * @param baseEventId id of the event to update
  * @param baseEvent updated event
  * @throws if the event cannot be updated
  * @returns the success status of the update
  * @returnObj `{ success }`
  */
export async function updateBaseEventLogic(baseEventId: number, baseEvent: BaseEventInsert) {
  // create a transaction to ensure both the base event and references are updated
  return await db.transaction(async (trx) => {
    // Update the base event
    await trx
      .update(baseEventSchema)
      .set({
        episodeId: baseEvent.episodeId,
        eventName: baseEvent.eventName,
        label: baseEvent.label,
        notes: baseEvent.notes,
      })
      .where(eq(baseEventSchema.baseEventId, baseEventId));

    // Clear and rebuild references (simpler and safer)
    await trx
      .delete(baseEventReferenceSchema)
      .where(eq(baseEventReferenceSchema.baseEventId, baseEventId));

    const eventRefs = baseEvent.references.map((referenceId) => ({
      baseEventId,
      referenceType: baseEvent.referenceType,
      referenceId,
    }));

    if (baseEvent.updateTribe) {
      eventRefs.push({
        baseEventId,
        referenceType: 'Tribe' as const,
        referenceId: baseEvent.updateTribe,
      });
    }

    if (eventRefs.length > 0) {
      await trx.insert(baseEventReferenceSchema).values(eventRefs);
    }

    return { success: true };
  });
}
