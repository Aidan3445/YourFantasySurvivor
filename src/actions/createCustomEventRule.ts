'use server';

import { requireLeagueAdminAuth } from '~/lib/auth';
import createCustomEventRuleLogic from '~/services/leagues/mutation/createCustomEventRule';
import { type CustomEventRuleInsert } from '~/types/leagues';

/**
  * Create a new league event rule
  * @param leagueHash Hash of the league to create the rule for
  * @param rule The rule to create
  * @throws an error if the rule cannot be created
  * @returns The ID of the created rule
  * @returnObj `{ newRuleId }`
  */
export default async function createCustomEventRule(
  leagueHash: string,
  rule: CustomEventRuleInsert
) {
  try {
    return await requireLeagueAdminAuth(createCustomEventRuleLogic)(leagueHash, rule);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to create league event rule', e);
    throw new Error('An error occurred while creating the league event rule.');
  }
}
