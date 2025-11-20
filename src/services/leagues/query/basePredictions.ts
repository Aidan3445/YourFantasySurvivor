import 'server-only';

import { db } from '~/server/db';
import { aliasedTable, and, eq, or, sql } from 'drizzle-orm';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { episodeSchema } from '~/server/db/schema/episodes';
import { baseEventPredictionRulesSchema, baseEventPredictionSchema, baseEventReferenceSchema, baseEventSchema } from '~/server/db/schema/baseEvents';
import { type ReferenceType, type Predictions } from '~/types/events';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { basePredictionRulesSchemaToObject } from '~/lib/utils';
import { type BaseEventPredictionRules } from '~/types/leagues';
import { leagueSchema } from '~/server/db/schema/leagues';

const eventEpisodeAlias = aliasedTable(episodeSchema, 'eventEpisode');

/**
 * Get the base predictions for a league
 * @param auth The authenticated league member
 * @returns the base predictions for the league
 * @returnObj `Predictions`
 */
export default async function getBasePredictions(auth: VerifiedLeagueMemberAuth) {
  const baseEventPredictionRules = await db
    .select()
    .from(baseEventPredictionRulesSchema)
    .where(eq(baseEventPredictionRulesSchema.leagueId, auth.leagueId))
    .then(rows => rows[0]);

  if (!baseEventPredictionRules) {
    // no base event rules, no predictions
    return {} as Predictions;
  }

  const rulesObject = basePredictionRulesSchemaToObject(baseEventPredictionRules);

  return db.selectDistinct({
    predictionId: baseEventPredictionSchema.baseEventPredictionId,
    predictionEpisodeNumber: episodeSchema.episodeNumber,
    eventEpisodeNumber: eventEpisodeAlias.episodeNumber,
    predictionMakerId: baseEventPredictionSchema.memberId,
    eventName: baseEventPredictionSchema.baseEventName,
    referenceId: baseEventPredictionSchema.referenceId,
    referenceType: baseEventPredictionSchema.referenceType,
    bet: baseEventPredictionSchema.bet,
    eventId: baseEventSchema.baseEventId,
    hit: sql<boolean>`
      CASE WHEN ${baseEventReferenceSchema.referenceId} = ${baseEventPredictionSchema.referenceId}
      AND ${baseEventReferenceSchema.referenceType} = ${baseEventPredictionSchema.referenceType}
      THEN true ELSE false END
    `.as('hit'),
  })
    .from(baseEventPredictionSchema)
    .innerJoin(episodeSchema, eq(episodeSchema.episodeId, baseEventPredictionSchema.episodeId))
    .innerJoin(leagueMemberSchema, eq(leagueMemberSchema.memberId, baseEventPredictionSchema.memberId))
    .innerJoin(leagueSchema, eq(leagueSchema.leagueId, leagueMemberSchema.leagueId))
    // result
    .leftJoin(baseEventSchema, and(
      eq(
        sql`cast(${baseEventSchema.eventName} as varchar)`,
        sql`cast(${baseEventPredictionSchema.baseEventName} as varchar)`),
      eq(baseEventSchema.episodeId, episodeSchema.episodeId),
      eq(episodeSchema.seasonId, leagueSchema.seasonId),
      or(
        // Weekly predictions need episode match
        and(
          eq(baseEventSchema.episodeId, baseEventPredictionSchema.episodeId),
          eq(getEventTimingType(rulesObject), 'weekly')
        ),
        // Non-weekly predictions just need an episode in the same season
        eq(getEventTimingType(rulesObject), 'non-weekly')
      )
    ))
    .leftJoin(eventEpisodeAlias, eq(eventEpisodeAlias.episodeId, baseEventSchema.episodeId))
    .leftJoin(baseEventReferenceSchema, eq(baseEventReferenceSchema.baseEventId, baseEventSchema.baseEventId))
    .where(eq(leagueMemberSchema.leagueId, auth.leagueId))
    .orderBy(episodeSchema.episodeNumber)
    .then((rows: {
      predictionId: number;
      predictionEpisodeNumber: number;
      eventEpisodeNumber: number | null;
      predictionMakerId: number;
      eventName: string;
      referenceId: number;
      referenceType: ReferenceType;
      bet: number | null;
      eventId: number | null;
      hit: boolean;
    }[]) => rows.reduce((acc, row) => {
      const episodeKey = row.eventEpisodeNumber ?? row.predictionEpisodeNumber;
      acc[episodeKey] ??= {};
      const predictions = acc[episodeKey];

      const previousPredictionIndex = predictions[episodeKey]?.findIndex(p =>
        p.predictionId === row.predictionId);

      if (previousPredictionIndex !== undefined && previousPredictionIndex > -1) {
        // if we already have this prediction, just update the hit status
        predictions[row.eventName]![previousPredictionIndex] = {
          ...predictions[row.eventName]![previousPredictionIndex]!,
          hit: row.hit || predictions[row.eventName]![previousPredictionIndex]!.hit,
        };
        return acc;
      }

      predictions[row.eventName] ??= [];
      predictions[row.eventName]!.push({
        eventSource: 'Base',
        episodeNumber: episodeKey,
        ...row,
      });
      return acc;
    }, {} as Predictions));
}

// Helper function - returns timing type for an event
function getEventTimingType(rulesObject: BaseEventPredictionRules) {
  const whenClauses = Object.entries(rulesObject)
    .map(([eventName, { timing }]) => {
      const isWeekly = timing.some(t => t.includes('Weekly'));
      return sql`WHEN ${baseEventPredictionSchema.baseEventName} = ${eventName} THEN ${isWeekly ? 'weekly' : 'non-weekly'}`;
    });
  return sql`CASE ${sql.join(whenClauses, sql` `)} ELSE null END`;
}
