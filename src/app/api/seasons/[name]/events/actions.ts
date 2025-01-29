'use server';
import { eq } from 'drizzle-orm';
import { sysAuth } from '~/app/api/system/query';
import { db } from '~/server/db';
import { castaways } from '~/server/db/schema/castaways';
import { baseEventCastaways, type BaseEventInsert, baseEvents, baseEventTribes, type EventName } from '~/server/db/schema/episodes';
import { type Reference } from '~/server/db/schema/leagues';

type ReferenceTable = typeof baseEventCastaways | typeof baseEventTribes;

export async function submitBaseEvent(
  episodeId: number,
  eventName: EventName,
  references: { id: number; /*notes: string[]*/ }[],
  referenceType: Reference,
  keywords: string[],
  notes: string[]
  //commonNotes: string[]
) {
  const { userId, sys } = await sysAuth();
  if (!userId) throw new Error('Not authenticated');
  if (!sys) throw new Error('Not authorized');


  // first insert the event
  const event = await db
    .insert(baseEvents)
    .values({ episodeId, eventName, keywords, notes })
    .returning({ id: baseEvents.baseEventId })
    .then((res) => res[0]);
  if (!event) throw new Error('Failed to insert event');

  try {
    let insertTable: ReferenceTable;
    switch (referenceType) {
      case 'castaway':
        insertTable = baseEventCastaways;
        break;
      case 'tribe':
        insertTable = baseEventTribes;
        break;
      case 'member':
        throw new Error('Member references not supported');
    }

    const confimration = await db
      .insert(insertTable)
      .values(references.map((ref) => ({ eventId: event.id, referenceId: ref.id })))
      .returning({ id: insertTable.baseEventReferenceId });
    if (confimration.length !== references.length) throw new Error('Failed to insert references');
  } catch {
    // rollback event
    await db
      .delete(baseEvents)
      .where(eq(baseEvents.baseEventId, event.id));
    throw new Error('Failed to insert references');
  }
}

export async function deleteBaseEvent(eventId: number) {
  const { userId, sys } = await sysAuth();
  if (!userId) throw new Error('Not authenticated');
  if (!sys) throw new Error('Not authorized');

  const deletedEvent = await db
    .delete(baseEvents)
    .where(eq(baseEvents.baseEventId, eventId))
    .returning({ id: baseEvents.baseEventId });
  if (!deletedEvent?.[0]) throw new Error('Failed to delete event');

  return deletedEvent[0].id;
}

export async function updateBaseEventDetails(eventId: number, editedEvent: BaseEventInsert) {
  const { userId, sys } = await sysAuth();
  if (!userId) throw new Error('Not authenticated');
  if (!sys) throw new Error('Not authorized');

  const updatedEvent = await db
    .update(baseEvents)
    .set(editedEvent)
    .where(eq(baseEvents.baseEventId, eventId))
    .returning({ id: baseEvents.baseEventId });
  if (!updatedEvent?.[0]) throw new Error('Failed to update event');

  return updatedEvent[0].id;
}

export async function updateBaseEventReferences(eventId: number, castawayIds?: number[], tribeIds?: number[]) {
  const { userId, sys } = await sysAuth();
  if (!userId) throw new Error('Not authenticated');
  if (!sys) throw new Error('Not authorized');

  if (!castawayIds && !tribeIds) throw new Error('No references provided');

  const update = async (table: ReferenceTable) => {
    // Get existing references
    const toRemove = await db
      .select({ referenceId: table.referenceId })
      .from(table)
      .where(eq(table.eventId, eventId));

    // Iterate through the new references to find minimal db updates for the event
    const toInsert = [];
    for (const castaway of castawayIds!) {
      const currentIndex = toRemove.findIndex((ref) => ref.referenceId === castaway);
      // If the new castaway is already in the current references
      // we don't need to insert it again
      if (currentIndex !== -1) {
        toRemove.splice(currentIndex, 1);
      } else {
        toInsert.push({ event: eventId, reference: castaway });
      }
    }

    // Insert new references
    const newRefs = Promise.all(toInsert.map((ref) => db
      .insert(table)
      .values({ eventId: eventId, referenceId: ref.reference })
      .returning({ referenceId: table.baseEventReferenceId })
    ));

    // Remove old references
    const removedRefs = Promise.all(toRemove.map((ref) => db
      .delete(table)
      .where(eq(table.baseEventReferenceId, ref.referenceId))
      .returning({ referenceId: table.baseEventReferenceId })
    ));

    return { newRefs, removedRefs };
  };

  const [castawayUpdate, tribeUpdate] = await Promise.all([
    castawayIds ? update(baseEventCastaways) : null,
    tribeIds ? update(baseEventTribes) : null
  ]);

  return { castawayIds: castawayUpdate?.newRefs, tribeIds: tribeUpdate?.newRefs };
}

