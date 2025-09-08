import 'server-only';

import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import { baseEventReferenceSchema, baseEventSchema } from '~/server/db/schema/baseEvents';
import { castawaySchema } from '~/server/db/schema/castaways';
import { episodeSchema } from '~/server/db/schema/episodes';
import { tribeSchema } from '~/server/db/schema/tribes';
import type { Events } from '~/types/events';

/**
  * Get the base events for a season
  * @param seasonId The season to get scores for
  * @returns The base events for the season organized by episode 
  * @returnObj `Events`
  */
export default async function getBaseEvents(seasonId: number) {
  return db
    .select({
      episodeNumber: episodeSchema.episodeNumber,
      episodeId: episodeSchema.episodeId,
      baseEventId: baseEventSchema.baseEventId,
      eventName: baseEventSchema.eventName,
      label: baseEventSchema.label,
      referenceType: baseEventReferenceSchema.referenceType,
      referenceId: baseEventReferenceSchema.referenceId,
      notes: baseEventSchema.notes
    })
    .from(baseEventSchema)
    .innerJoin(episodeSchema, eq(baseEventSchema.episodeId, episodeSchema.episodeId))
    .innerJoin(baseEventReferenceSchema, eq(baseEventSchema.baseEventId, baseEventReferenceSchema.baseEventId))
    .leftJoin(castawaySchema, and(
      eq(baseEventReferenceSchema.referenceId, castawaySchema.castawayId),
      eq(baseEventReferenceSchema.referenceType, 'Castaway')))
    .leftJoin(tribeSchema, and(
      eq(baseEventReferenceSchema.referenceId, tribeSchema.tribeId),
      eq(baseEventReferenceSchema.referenceType, 'Tribe')))
    .where(eq(episodeSchema.seasonId, seasonId))
    .orderBy(episodeSchema.episodeNumber)
    .then(rows => rows.reduce((acc, row) => {
      acc[row.episodeNumber] ??= {};
      const events = acc[row.episodeNumber]!;
      events[row.baseEventId] ??= {
        eventSource: 'Base',
        eventType: 'Direct',
        episodeNumber: row.episodeNumber,
        episodeId: row.episodeId,
        eventId: row.baseEventId,
        eventName: row.eventName,
        label: row.label,
        notes: row.notes,
        references: [],
      };
      events[row.baseEventId]!.references.push({
        type: row.referenceType,
        id: row.referenceId,
      });
      return acc;
    }, {} as Events));
}
