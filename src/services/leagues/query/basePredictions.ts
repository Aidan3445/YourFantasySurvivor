import 'server-only';

import { db } from '~/server/db';
import { and, eq, sql } from 'drizzle-orm';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { episodeSchema } from '~/server/db/schema/episodes';
import { baseEventPredictionSchema, baseEventReferenceSchema, baseEventSchema } from '~/server/db/schema/baseEvents';
import { type Predictions } from '~/types/events';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
 * Get the base predictions for a league
 * @param auth The authenticated league member
 * @returns the base predictions for the league
 * @returnObj `Predictions`
 */
export default async function getBasePredictions(auth: VerifiedLeagueMemberAuth) {
  return await db.select({
    episodeNumber: episodeSchema.episodeNumber,
    predictionMakerId: baseEventPredictionSchema.memberId,
    eventName: baseEventPredictionSchema.baseEventName,
    referenceId: baseEventPredictionSchema.referenceId,
    referenceType: baseEventPredictionSchema.referenceType,
    bet: baseEventPredictionSchema.bet,
    hit: sql<boolean>`
      CASE WHEN ${baseEventReferenceSchema.referenceId} = ${baseEventPredictionSchema.referenceId}
      AND ${baseEventReferenceSchema.referenceType} = ${baseEventPredictionSchema.referenceType}
      THEN true ELSE false END
    `.as('hit'),
  })
    .from(baseEventPredictionSchema)
    .innerJoin(episodeSchema, eq(baseEventPredictionSchema.episodeId, episodeSchema.episodeId))
    .innerJoin(leagueMemberSchema, eq(baseEventPredictionSchema.memberId, leagueMemberSchema.memberId))
    // result
    .innerJoin(baseEventSchema, and(
      eq(
        sql`cast(${baseEventSchema.eventName} as varchar)`,
        sql`cast(${baseEventPredictionSchema.baseEventName} as varchar)`),
      eq(baseEventSchema.episodeId, episodeSchema.episodeId)))
    .leftJoin(baseEventReferenceSchema, eq(baseEventReferenceSchema.baseEventId, baseEventSchema.baseEventId))
    .where(eq(leagueMemberSchema.leagueId, auth.leagueId))
    .orderBy(episodeSchema.episodeNumber)
    .then((rows) => rows.reduce((acc, row) => {
      acc[row.episodeNumber] ??= {};
      const predictions = acc[row.episodeNumber]!;
      predictions[row.eventName] ??= [];
      predictions[row.eventName]!.push({
        eventSource: 'Base',
        ...row,
      });
      return acc;
    }, {} as Predictions));
}
