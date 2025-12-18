import 'server-only';

import { db } from '~/server/db';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { type ScoringBaseEventName, type PredictionInsert } from '~/types/events';
import getPredictionTimings from '~/services/leagues/query/predictionTimings';
import getLeagueRules from '~/services/leagues/query/rules';
import { baseEventPredictionSchema } from '~/server/db/schema/baseEvents';
import { customEventPredictionSchema } from '~/server/db/schema/customEvents';
import getKeyEpisodes from '~/services/seasons/query/getKeyEpisodes';
import { getSeasonData } from '~/services/seasons/query/seasonsData';
import getSelectionTimeline from '~/services/leagues/query/selectionTimeline';
import getCustomEventsAndPredictions from '~/services/leagues/query/customEvents';
import getBasePredictions from '~/services/leagues/query/basePredictions';
import getLeagueSettings from '~/services/leagues/query/settings';
import { compileScores } from '~/lib/scores';

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
  if (auth.status === 'Inactive') throw new Error('League is inactive');


  // Insert or update the prediction
  return db.transaction(async (trx) => {
    const keyEpisodes = await getKeyEpisodes(auth.seasonId);
    const predictionTimings = await getPredictionTimings(auth);
    if (predictionTimings.length === 0 || !keyEpisodes.nextEpisode)
      throw new Error('Predictions cannot be made at this time');

    // Check the member's current score to ensure they have enough points to make the bet
    const currentScore = await getMemberBetBalance(auth, keyEpisodes.nextEpisode.episodeNumber);
    if ((prediction.bet ?? 0) > currentScore) {
      throw new Error('Insufficient points to make this prediction');
    }

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

/**
  * Helper to get the current score of the member to ensure betting limits are not exceeded
  * @param auth The authenticated league member
  * @param nextEpisodeNumber The episode number of the next episode
  * @returns the current score of the member
  * @returnObj `score`
  */
async function getMemberBetBalance(auth: VerifiedLeagueMemberAuth, nextEpisodeNumber: number) {
  const seasonData = await getSeasonData(auth.seasonId);
  const selectionTimeline = await getSelectionTimeline(auth);
  const customEvents = await getCustomEventsAndPredictions(auth);
  const basePredictions = await getBasePredictions(auth);
  const leagueRules = await getLeagueRules(auth);
  const leagueSettings = await getLeagueSettings(auth);

  if (!seasonData) throw new Error('Season data not found');
  if (!leagueRules) throw new Error('League rules not found');
  if (!leagueSettings) throw new Error('League settings not found');
  if (!selectionTimeline) throw new Error('Selection timeline not found');
  if (!basePredictions) throw new Error('Base predictions not found');
  if (!customEvents) throw new Error('Custom events not found');

  const { scores } = compileScores(
    seasonData.baseEvents,
    seasonData.eliminations,
    seasonData.tribesTimeline,
    seasonData.keyEpisodes,
    selectionTimeline,
    customEvents,
    basePredictions,
    leagueRules,
    leagueSettings.survivalCap,
    leagueSettings.preserveStreak,
  );

  const score = scores.Member[auth.memberId]?.slice().pop() ?? 0;

  const basePredictionsMade = Object.values(basePredictions[nextEpisodeNumber] ?? {})
    .map((predictions) => {
      return predictions?.filter(pred => !!pred.bet && pred.predictionMakerId === auth.memberId);
    }).flat() ?? [];
  const customPredictionsMade = Object.values(customEvents.predictions[nextEpisodeNumber] ?? {})
    .map((preds) => {
      return preds?.filter(pred => !!pred.bet && pred.predictionMakerId === auth.memberId);
    }).flat() ?? [];

  const totalBetsMade = [...basePredictionsMade, ...customPredictionsMade]
    .reduce((acc, pred) => acc + (pred.bet ?? 0), 0);

  return score - totalBetsMade;
}
