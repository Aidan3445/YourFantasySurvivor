import 'server-only';

import { db } from '~/server/db';
import { and, eq, sql } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { episodeSchema } from '~/server/db/schema/episodes';
import { customEventPredictionSchema, customEventReferenceSchema, customEventRuleSchema, customEventSchema } from '~/server/db/schema/customEvents';
import { type Prediction } from '~/types/events';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';

/**
  * Get the custom events for a league
  * @param hash The hash of the league
  * @returns the custom league events
  * @returnObj `Prediction[]`
  */
export default async function getCustomPredictions(hash: string) {
  return db
    .select({
      eventId: customEventSchema.customEventRuleId,
      episodeNumber: episodeSchema.episodeNumber,
      predictionMakerId: customEventPredictionSchema.memberId,
      referenceId: customEventPredictionSchema.referenceId,
      referenceType: customEventPredictionSchema.refernceType,
      hit: sql<boolean>`
        CASE WHEN ${customEventReferenceSchema} = ${customEventPredictionSchema.referenceId}
        AND ${customEventReferenceSchema} = ${customEventPredictionSchema.refernceType}
        THEN true ELSE false END
      `.as('hit'),
    })
    .from(customEventPredictionSchema)
    .innerJoin(episodeSchema, eq(episodeSchema.episodeId, customEventPredictionSchema.episodeId))
    .innerJoin(leagueMemberSchema, eq(leagueMemberSchema.memberId, customEventPredictionSchema.memberId))
    .innerJoin(leagueSchema, eq(leagueSchema.leagueId, leagueMemberSchema.leagueId))
    // result
    .innerJoin(customEventSchema, and(
      eq(customEventSchema.customEventRuleId, customEventPredictionSchema.customEventRuleId),
      eq(customEventSchema.episodeId, episodeSchema.episodeId)))
    .innerJoin(customEventRuleSchema, and(
      eq(customEventRuleSchema.customEventRuleId, customEventSchema.customEventRuleId),
      eq(customEventRuleSchema.eventType, 'Prediction')))
    .leftJoin(customEventReferenceSchema, eq(customEventReferenceSchema.customEventId, customEventSchema.customEventId))
    .where(eq(leagueSchema.hash, hash))
    .orderBy(episodeSchema.episodeNumber)
    .then(predictions => predictions.map(p => ({
      ...p,
      eventSource: 'Custom'
    } as Prediction)));
}
