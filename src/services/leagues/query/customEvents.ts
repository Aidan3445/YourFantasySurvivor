import 'server-only';

import { db } from '~/server/db';
import { and, eq, sql } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { episodeSchema } from '~/server/db/schema/episodes';
import { customEventPredictionSchema, customEventReferenceSchema, customEventRuleSchema, customEventSchema } from '~/server/db/schema/customEvents';
import { type EventWithReferences, type Prediction } from '~/types/events';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';

/**
  * Get custom events and predictions for a league
  * @param hash The hash of the league
  * @returns the custom league events and predictions
  * @returnObj `events: Record<episodeNumber, Record<eventId, EventWithReferences>>
  * predictions: Prediction[]`
  */
export default async function getCustomEventsAndPredictions(hash: string) {
  const eventsReq = getCustomEvents(hash);
  const predictionsReq = getCustomPredictions(hash);
  const [events, predictions] = await Promise.all([eventsReq, predictionsReq]);
  return { events, predictions };
}

/**
  * Get the custom events for a league
  * @param hash The hash of the league
  * @returns the custom league events
  * @returnObj `Record<episodeNumber, Record<eventId, EventWithReferences>>`
  */
export async function getCustomEvents(hash: string) {
  return db
    .select({
      episodeNumber: episodeSchema.episodeNumber,
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
    .innerJoin(leagueSchema, eq(leagueSchema.leagueId, customEventRuleSchema.leagueId))
    .innerJoin(episodeSchema, eq(episodeSchema.episodeId, customEventSchema.episodeId))
    .innerJoin(customEventReferenceSchema, eq(customEventReferenceSchema.customEventId, customEventSchema.customEventId))
    .where(eq(leagueSchema.hash, hash))
    .orderBy(episodeSchema.episodeNumber)
    .then(rows => rows.reduce((acc, row) => {
      acc[row.episodeNumber] ??= [];
      const events = acc[row.episodeNumber]!;
      events[row.customEventRuleId] ??= {
        eventSource: 'Custom',
        eventType: row.eventType,
        episodeNumber: row.episodeNumber,
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
    }, {} as Record<number, Record<number, EventWithReferences>>));
}

/**
  * Get the custom events for a league
  * @param hash The hash of the league
  * @returns the custom league events
  * @returnObj `Prediction[]`
  */
export async function getCustomPredictions(hash: string) {
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


