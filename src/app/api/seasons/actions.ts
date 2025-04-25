'use server';

import { db } from '~/server/db';
import { baseEventReferenceSchema, baseEventsSchema } from '~/server/db/schema/baseEvents';
import { type BaseEventInsert } from '~/server/db/defs/events';
import { eq } from 'drizzle-orm';
import { systemAdminAuth } from '~/lib/auth';

/**
  * Create a new base event for the season
  * @param baseEvent event to create
  * @throws if the user is not a system admin
  * @throws if the event cannot be created
  */
export async function createBaseEvent(baseEvent: BaseEventInsert) {
  const { userId } = await systemAdminAuth();
  if (!userId) throw new Error('User not authorized');

  // create transaction for the event and reference insertions
  await db.transaction(async (trx) => {
    try {
      // insert the base event
      const baseEventId = await db
        .insert(baseEventsSchema)
        .values({
          episodeId: baseEvent.episodeId,
          eventName: baseEvent.eventName,
          label: baseEvent.label,
          notes: baseEvent.notes,
        })
        .returning({ baseEventId: baseEventsSchema.baseEventId })
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
      await db
        .insert(baseEventReferenceSchema)
        .values(eventRefs);
    }
    catch (e) {
      console.error('Failed to create base event', e);
      trx.rollback();
      throw new Error('Failed to create base event');
    }
  });
}

/**
  * Update a base event for the season
  * @param baseEventId id of the event to update
  * @param baseEvent updated event
  * @throws if the user is not a system admin
  * @throws if the event cannot be updated
  */
export async function updateBaseEvent(baseEventId: number, baseEvent: BaseEventInsert) {
  const { userId } = await systemAdminAuth();
  if (!userId) throw new Error('User not authorized');

  // for now we are inefficient and updating both the event and references
  // regardless of whether they have changed or not by deleting and reinserting
  // all references, in the future we can optimize this by providing a diff
  await db.transaction(async (trx) => {
    try {
      // update the base event
      await db
        .update(baseEventsSchema)
        .set({
          episodeId: baseEvent.episodeId,
          eventName: baseEvent.eventName,
          label: baseEvent.label,
          notes: baseEvent.notes,
        })
        .where(eq(baseEventsSchema.baseEventId, baseEventId));

      // delete existing references
      const oldRefs = await db
        .delete(baseEventReferenceSchema)
        .where(eq(baseEventReferenceSchema.baseEventId, baseEventId))
        .returning({
          referenceId: baseEventReferenceSchema.referenceId,
          referenceType: baseEventReferenceSchema.referenceType
        });

      // insert the new references
      await db
        .insert(baseEventReferenceSchema)
        .values(baseEvent.references.map((referenceId) => ({
          baseEventId,
          referenceType: oldRefs
            .find((ref) => ref.referenceId === referenceId)?.referenceType ??
            baseEvent.referenceType, // use the old reference type if it exists
          referenceId: referenceId,
        })));
    }
    catch (e) {
      console.error('Failed to update base event', e);
      trx.rollback();
      throw new Error('Failed to update base event');
    }
  });
}

/**
  * Delete a base event for the season
  * @param baseEventId id of the event to delete
  * @throws if the user is not a system admin
  * @throws if the event cannot be deleted
  */
export async function deleteBaseEvent(baseEventId: number) {
  const { userId } = await systemAdminAuth();
  if (!userId) throw new Error('User not authorized');

  // unlike update and insert, cascade delete will take care of deleting
  // the references as well, nice!
  await db
    .delete(baseEventsSchema)
    .where(eq(baseEventsSchema.baseEventId, baseEventId));
}

