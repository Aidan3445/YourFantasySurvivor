'use server';
import { eq } from 'drizzle-orm';
import { sysAuth } from '~/app/api/system/query';
import { db } from '~/server/db';
import { baseEventCastaways, baseEvents, baseEventTribes, type EventName } from '~/server/db/schema/episodes';
import { type Reference } from '~/server/db/schema/leagues';

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
    .values({ episode: episodeId, eventName, keywords, notes })
    .returning({ id: baseEvents.id })
    .then((res) => res[0]);
  if (!event) throw new Error('Failed to insert event');

  try {
    let insertTable: typeof baseEventCastaways | typeof baseEventTribes;
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
      .values(references.map((ref) => ({ event: event.id, reference: ref.id })))
      .returning({ id: insertTable.id });
    if (confimration.length !== references.length) throw new Error('Failed to insert references');
  } catch {
    // rollback event
    await db
      .delete(baseEvents)
      .where(eq(baseEvents.id, event.id));
    throw new Error('Failed to insert references');
  }
}
