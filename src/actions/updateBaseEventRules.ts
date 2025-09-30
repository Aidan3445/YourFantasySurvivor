'use server';

import { requireLeagueOwnerAuth } from '~/lib/auth';
import updateBaseEventRulesLogic from '~/services/leagues/mutation/updateBaseEventRules';
import { type BaseEventPredictionRules, type BaseEventRules } from '~/types/leagues';

/**
  * Update the base event rules for a league
  * @param hash The hash of the league
  * @param baseRules The new base event rules
  * @param predictionRules The new prediction rules
  * @throws an error if the rules cannot be updated
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function updateBaseEventRules(
  hash: string,
  baseRules: BaseEventRules,
  predictionRules: BaseEventPredictionRules
) {
  try {
    return await requireLeagueOwnerAuth(updateBaseEventRulesLogic)(hash, baseRules, predictionRules);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to update base event rules', e);
    throw new Error('An error occurred while updating the base event rules.');
  }
}
