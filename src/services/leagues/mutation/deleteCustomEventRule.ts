'use server';

import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import { leagueEventsRulesSchema } from '~/server/db/schema/leagueEvents';
import { leagueSchema } from '~/server/db/schema/leagues';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
 * Delete a league event rule
 * @param auth The authenticated league member
 * @param leagueHash The hash of the league
 * @param eventName The event name of the rule to delete
 * @throws an error if the user is not authorized
 * @throws an error if the rule cannot be deleted
 * @returns Success status of the deletion
 * @returnObj `{ success }`
 */
export default async function deleteLeagueEventRuleLogic(
  auth: VerifiedLeagueMemberAuth,
  ruleId: number,
) {
  // Transaction to delete the rule
  return await db.transaction(async (trx) => {
    // Get league information
    const league = await trx
      .select({
        leagueId: leagueSchema.leagueId,
        leagueStatus: leagueSchema.status,
      })
      .from(leagueSchema)
      .where(eq(leagueSchema.leagueId, auth.leagueId))
      .then((res) => res[0]);
    if (!league) throw new Error('League not found');

    if (league.leagueStatus === 'Inactive')
      throw new Error('League rules cannot be deleted while the league is inactive');

    const deleted = await trx
      .delete(leagueEventsRulesSchema)
      .where(and(
        eq(leagueEventsRulesSchema.leagueId, league.leagueId),
        eq(leagueEventsRulesSchema.leagueEventRuleId, ruleId)))
      .returning({ leagueEventRuleId: leagueEventsRulesSchema.leagueEventRuleId })
      .then(res => res[0]);
    if (!deleted) throw new Error('Rule not found');

    return { success: true };
  });
}
