'use server';

import { db } from '~/server/db';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { type ScoringBaseEventName, type PredictionInsert } from '~/types/events';
import getPredictionTimings from '~/services/leagues/query/predictionTimings';
import getLeagueRules from '~/services/leagues/query/rules';
import { baseEventPredictionSchema } from '~/server/db/schema/baseEvents';
import { customEventPredictionSchema } from '~/server/db/schema/customEvents';
import getKeyEpisodes from '~/services/leagues/query/getKeyEpisodes';

/**
  * Make a league event prediction or update an existing prediction if it exists
  * @param auth The authenticated league member
  * @param prediction The prediction to make
  * @throws an error if the prediction cannot be made
  * @returns Success status of the prediction and if it was created or updated
  * @returnObj `{ success, wasUpdate }`
  */
export default async function makePredictionLogic(
  auth: VerifiedLeagueMemberAuth,
  prediction: PredictionInsert
) {
  // Insert or update the prediction
  return db.transaction(async (trx) => {
    const keyEpisodes = await getKeyEpisodes(auth.seasonId);
    const predictionTimings = await getPredictionTimings(auth);

    if (predictionTimings.length === 0 || !keyEpisodes.nextEpisode)
      throw new Error('Predictions cannot be made at this time');

    const rules = await getLeagueRules(auth);

    if (!rules) throw new Error('League rules not found');

    switch (prediction.eventSource) {
      case 'Base': {
        const eventName = prediction.eventName as ScoringBaseEventName;
        const rule = rules.basePrediction?.[eventName];
        if (!rule?.enabled) throw new Error(`Predictions for ${prediction.eventName} are not enabled`);
        if (!predictionTimings.some(t => rule.timing.includes(t))) {
          throw new Error(`Predictions for ${prediction.eventName} cannot be made at this time`);
        }
        // Upsert the prediction
        const wasUpdate = await trx
          .insert(baseEventPredictionSchema)
          .values({
            ...prediction,
            episodeId: keyEpisodes.nextEpisode.episodeId,
            baseEventName: eventName,
            memberId: auth.memberId
          })
          .onConflictDoUpdate({
            target: [
              baseEventPredictionSchema.baseEventName,
              baseEventPredictionSchema.episodeId,
              baseEventPredictionSchema.memberId
            ],
            set: {
              referenceId: prediction.referenceId,
              referenceType: prediction.referenceType,
              bet: prediction.bet,
            }
          })
          .returning({
            createdAt: baseEventPredictionSchema.created_at,
            updatedAt: baseEventPredictionSchema.updated_at
          })
          .then(res => {
            if (res.length === 0) return false;
            const r = res[0]!;
            return r.createdAt.getTime() !== r.updatedAt.getTime();
          });
        return { success: true, wasUpdate };
      }
      case 'Custom': {
        const rule = rules.custom
          .find(r => r.eventName === prediction.eventName && r.eventType === 'Prediction');
        if (!rule) throw new Error(`Predictions for ${prediction.eventName} are not enabled`);
        if (!predictionTimings.some(t => rule.timing.includes(t))) {
          throw new Error(`Predictions for ${prediction.eventName} cannot be made at this time`);
        }
        // Upsert the prediction
        const wasUpdate = await trx
          .insert(customEventPredictionSchema)
          .values({
            ...prediction,
            episodeId: keyEpisodes.nextEpisode.episodeId,
            customEventRuleId: rule.customEventRuleId,
            memberId: auth.memberId
          })
          .onConflictDoUpdate({
            target: [
              customEventPredictionSchema.customEventRuleId,
              customEventPredictionSchema.episodeId,
              customEventPredictionSchema.memberId
            ],
            set: {
              referenceId: prediction.referenceId,
              referenceType: prediction.referenceType,
              bet: prediction.bet,
            }
          })
          .returning({
            createdAt: customEventPredictionSchema.created_at,
            updatedAt: customEventPredictionSchema.updated_at
          })
          .then(res => {
            if (res.length === 0) return false;
            const r = res[0]!;
            return r.createdAt.getTime() !== r.updatedAt.getTime();
          });
        return { success: true, wasUpdate };
      }
      default:
        throw new Error('Invalid event source');
    }
  });
}
