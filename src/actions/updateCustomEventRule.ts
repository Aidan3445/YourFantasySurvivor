'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import updateCustomEventRuleLogic from '~/services/leagues/mutation/updateCustomEventRule';
import { type CustomEventRuleInsert } from '~/types/leagues';

/**
 * Update a league event rule
 * @param auth - the authenticated league member
 * @param leagueHash - the hash of the league
 * @param rule - the rule to update
 * @throws an error if the user is not authorized
 * @throws an error if the rule cannot be updated
 * @returns Success status of the update
 * @returnObj `{ success }`
 */
export default async function updateCustomEventRule(
  leagueHash: string,
  rule: CustomEventRuleInsert,
  ruleId: number,
) {
  try {
    return await requireLeagueMemberAuth(updateCustomEventRuleLogic)(leagueHash, rule, ruleId);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to update league event rule', e);
    throw new Error('An error occurred while updating the league event rule. Please try again.');
  }
}
