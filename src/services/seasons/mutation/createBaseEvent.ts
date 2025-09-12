import 'server-only';

import { revalidateTag } from 'next/cache';
import { EliminationEventNames } from '~/lib/events';
import { db } from '~/server/db';
import { baseEventReferenceSchema, baseEventSchema } from '~/server/db/schema/baseEvents';
import { type BaseEventInsert } from '~/types/events';

/**
  * Create a new base event for the season
  * @param baseEvent event to create
  * @throws if the event cannot be created
  * @returns the id of the created base event
  * @returnObj `{ newEventId }`
  */
export default async function createBaseEventLogic(baseEvent: BaseEventInsert) {
  // create transaction for the event and reference insertions
  return await db.transaction(async (trx) => {
    // insert the base event
    const newEventId = await trx
      .insert(baseEventSchema)
      .values({
        episodeId: baseEvent.episodeId,
        eventName: baseEvent.eventName,
        label: baseEvent.label,
        notes: baseEvent.notes?.map(note => note.trim()).filter(note => note.length > 0),
      })
      .returning({ baseEventId: baseEventSchema.baseEventId })
      .then((result) => result[0]?.baseEventId);

    if (!newEventId) throw new Error('Failed to create base event');

    const eventRefs = baseEvent.references.map((reference) => ({
      baseEventId: newEventId,
      referenceType: reference.type,
      referenceId: reference.id,
    }));

    // insert the base event references
    await trx
      .insert(baseEventReferenceSchema)
      .values(eventRefs);

    if ([...EliminationEventNames, 'tribeUpdate'].includes(baseEvent.eventName)) {
      // Invalidate cache
      revalidateTag('tribe-members');
    }

    return { newEventId };
  });
}
