'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import makePredictionLogic from '~/services/leagues/mutation/makePrediction';
import { type PredictionInsert } from '~/types/events';

/**
  * Make a league event prediction or update an existing prediction if it exists
  * @param leagueHash Hash of the league to make the prediction for
  * @param prediction The prediction to make
  * @throws an error if the prediction cannot be made
  * @returns Success status of the prediction
  * @returnObj `{ success }`
  */
export default async function makePrediction(
  leagueHash: string,
  prediction: PredictionInsert
) {
  try {
    return await requireLeagueMemberAuth(makePredictionLogic)(leagueHash, prediction);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to make prediction', e);
    throw new Error('An error occurred while making the prediction.');
  }
}
