import 'server-only';

import { db } from '~/server/db';
import { and, eq, sql } from 'drizzle-orm';
import { episodeSchema } from '~/server/db/schema/episodes';
import { customEventPredictionSchema, customEventReferenceSchema, customEventRuleSchema, customEventSchema } from '~/server/db/schema/customEvents';
import { type Events, type CustomEvents, type Predictions } from '~/types/events';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
  * Get custom events and predictions for a league
  * @param auth The authenticated league member
  * @returns the custom league events and predictions
  * @returnObj `CustomEvents`
  */
export default async function getCustomEventsAndPredictions(auth: VerifiedLeagueMemberAuth) {
  const eventsReq = getCustomEvents(auth);
  const predictionsReq = getCustomPredictions(auth);
  const [events, predictions] = await Promise.all([eventsReq, predictionsReq]);
  return { events, predictions } as CustomEvents;
}

/**
  * Get the custom events for a league
  * @param auth The authenticated league member
  * @returns the custom league events
  * @returnObj `Events`
  */
export async function getCustomEvents(auth: VerifiedLeagueMemberAuth) {
  return db
    .select({
      episodeNumber: episodeSchema.episodeNumber,
      episodeId: episodeSchema.episodeId,
      customEventRuleId: customEventSchema.customEventRuleId,
      eventName: customEventRuleSchema.eventName,
      eventType: customEventRuleSchema.eventType,
      label: customEventSchema.label,
      referenceType: customEventReferenceSchema.referenceType,
      referenceId: customEventReferenceSchema.referenceId,
      notes: customEventSchema.notes,
    })
    .from(customEventSchema)
    .innerJoin(customEventRuleSchema, eq(customEventRuleSchema.customEventRuleId, customEventSchema.customEventRuleId))
    .innerJoin(episodeSchema, eq(episodeSchema.episodeId, customEventSchema.episodeId))
    .innerJoin(customEventReferenceSchema, eq(customEventReferenceSchema.customEventId, customEventSchema.customEventId))
    .where(eq(customEventRuleSchema.leagueId, auth.leagueId))
    .orderBy(episodeSchema.episodeNumber)
    .then(rows => rows.reduce((acc, row) => {
      acc[row.episodeNumber] ??= [];
      const events = acc[row.episodeNumber]!;
      events[row.customEventRuleId] ??= {
        eventSource: 'Custom',
        eventType: row.eventType,
        customEventRuleId: row.customEventRuleId,
        episodeNumber: row.episodeNumber,
        episodeId: row.episodeId,
        eventId: row.customEventRuleId,
        eventName: row.eventName,
        label: row.label,
        notes: row.notes,
        references: []
      };
      events[row.customEventRuleId]!.references.push({
        type: row.referenceType,
        id: row.referenceId
      });
      return acc;
    }, {} as Events));
}

/**
  * Get the custom events for a league
  * @param auth The authenticated league member
  * @returns the custom league events
  * @returnObj `Predictions`
  */
export async function getCustomPredictions(auth: VerifiedLeagueMemberAuth) {
  return db
    .select({
      episodeNumber: episodeSchema.episodeNumber,
      predictionMakerId: customEventPredictionSchema.memberId,
      eventName: customEventRuleSchema.eventName,
      referenceId: customEventPredictionSchema.referenceId,
      referenceType: customEventPredictionSchema.referenceType,
      bet: customEventPredictionSchema.bet,
      hit: sql<boolean>`
        CASE WHEN ${customEventReferenceSchema} = ${customEventPredictionSchema.referenceId}
        AND ${customEventReferenceSchema} = ${customEventPredictionSchema.referenceType}
        THEN true ELSE false END
      `.as('hit'),
    })
    .from(customEventPredictionSchema)
    .innerJoin(episodeSchema, eq(episodeSchema.episodeId, customEventPredictionSchema.episodeId))
    .innerJoin(leagueMemberSchema, eq(leagueMemberSchema.memberId, customEventPredictionSchema.memberId))
    // result
    .innerJoin(customEventSchema, and(
      eq(customEventSchema.customEventRuleId, customEventPredictionSchema.customEventRuleId),
      eq(customEventSchema.episodeId, episodeSchema.episodeId)))
    .innerJoin(customEventRuleSchema, and(
      eq(customEventRuleSchema.customEventRuleId, customEventSchema.customEventRuleId),
      eq(customEventRuleSchema.eventType, 'Prediction')))
    .leftJoin(customEventReferenceSchema, eq(customEventReferenceSchema.customEventId, customEventSchema.customEventId))
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
