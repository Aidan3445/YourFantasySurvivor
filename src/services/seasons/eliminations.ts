import 'server-only';

import { db } from '~/server/db';
import { and, asc, eq, inArray, lte } from 'drizzle-orm';
import { episodeSchema } from '~/server/db/schema/episodes';
import { castawaySchema } from '~/server/db/schema/castaways';
import { baseEventReferenceSchema, baseEventSchema } from '~/server/db/schema/baseEvents';
import { EliminationEventNames } from '~/lib/events';
import { type Elimination } from '~/types/events';

/**
  * Get the castaways eliminated in each episode of a season
  * @param seasonId The season to get eliminations for
  * @returns The castaways eliminated in each episode
  * @returnObj `Record<episodeNumber, Elimination[]>`
  */
export default async function getEliminations(seasonId: number) {
  const now = new Date().toISOString();

  return db
    .select({
      episodeNumber: episodeSchema.episodeNumber,
      eventId: baseEventSchema.baseEventId,
      castawayId: castawaySchema.castawayId,
    })
    .from(episodeSchema)
    .leftJoin(baseEventSchema, and(
      eq(episodeSchema.episodeId, baseEventSchema.episodeId),
      inArray(baseEventSchema.eventName, EliminationEventNames)))
    .leftJoin(baseEventReferenceSchema, and(
      eq(baseEventSchema.baseEventId, baseEventReferenceSchema.baseEventId),
      eq(baseEventReferenceSchema.referenceType, 'Castaway')))
    .leftJoin(castawaySchema, eq(baseEventReferenceSchema.referenceId, castawaySchema.castawayId))
    .where(and(
      eq(episodeSchema.seasonId, seasonId),
      lte(episodeSchema.airDate, now)))
    .orderBy(asc(episodeSchema.episodeNumber))
    .then((rows) => rows.reduce((acc, row) => {
      acc[row.episodeNumber] ??= [];
      if (row.castawayId !== null && row.eventId !== null) {
        acc[row.episodeNumber]!.push({
          castawayId: row.castawayId,
          eventId: row.eventId,
        });
      }
      return acc;
    }, {} as Record<number, Elimination[]>));
}
