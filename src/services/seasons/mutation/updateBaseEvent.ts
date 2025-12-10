import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { baseEventReferenceSchema, baseEventSchema } from '~/server/db/schema/baseEvents';
import { type BaseEventInsert } from '~/types/events';
import { EliminationEventNames } from '~/lib/events';
import { revalidateTag } from 'next/cache';

/**
  * Update a base event for the season
  * @param baseEventId id of the event to update
  * @param baseEvent updated event
  * @throws if the event cannot be updated
  * @returns the success status of the update
  * @returnObj `{ success }`
  */
export default async function updateBaseEventLogic(baseEventId: number, baseEvent: BaseEventInsert) {
  // create a transaction to ensure both the base event and references are updated
  return await db.transaction(async (trx) => {
    // Update the base event
    const event = await trx
      .update(baseEventSchema)
      .set({
        episodeId: baseEvent.episodeId,
        eventName: baseEvent.eventName,
        label: baseEvent.label,
        notes: baseEvent.notes?.map(note => note.trim()).filter(note => note.length > 0),
      })
      .where(eq(baseEventSchema.baseEventId, baseEventId))
      .returning({ eventName: baseEventSchema.eventName });

    // Clear and rebuild references (simpler and safer)
    await trx
      .delete(baseEventReferenceSchema)
      .where(eq(baseEventReferenceSchema.baseEventId, baseEventId));

    const eventRefs = baseEvent.references.map((reference) => ({
      baseEventId,
      referenceType: reference.type,
      referenceId: reference.id,
    }));

    if (eventRefs.length > 0) {
      await trx.insert(baseEventReferenceSchema).values(eventRefs);
    }

    if (['tribeUpdate', ...EliminationEventNames].includes(event[0]!.eventName)) {
      // Invalidate cache
      revalidateTag('tribe-members', 'max');
    }
    revalidateTag('base-events', 'max');

    return { success: true };
  });
}
