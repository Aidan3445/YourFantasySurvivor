'use server';

import { db } from '~/server/db';
import { baseEventReferenceSchema, baseEventSchema } from '~/server/db/schema/baseEvents';
import { systemAdminAuth } from '~/lib/auth';
import { type BaseEventInsert } from '~/types/events';

/**
  * Create a new base event for the season
  * @param baseEvent event to create
  * @throws if the event cannot be created
  * @returns the id of the created base event
  * @returnObj `newEventId`
  */
export default async function createBaseEventLogic(baseEvent: BaseEventInsert) {
  // create transaction for the event and reference insertions
  return await db.transaction(async (trx) => {
    // insert the base event
    const baseEventId = await trx
      .insert(baseEventSchema)
      .values({
        episodeId: baseEvent.episodeId,
        eventName: baseEvent.eventName,
        label: baseEvent.label,
        notes: baseEvent.notes,
      })
      .returning({ baseEventId: baseEventSchema.baseEventId })
      .then((result) => result[0]?.baseEventId);

    if (!baseEventId) throw new Error('Failed to create base event');

    const eventRefs = baseEvent.references.map((referenceId) => ({
      baseEventId,
      referenceType: baseEvent.referenceType,
      referenceId: referenceId,
    }));

    if (baseEvent.updateTribe) {
      eventRefs.push({
        baseEventId,
        referenceType: 'Tribe',
        referenceId: baseEvent.updateTribe,
      });
    }

    // insert the base event references
    await trx
      .insert(baseEventReferenceSchema)
      .values(eventRefs);

    return baseEventId;
  });
}
