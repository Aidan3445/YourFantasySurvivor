'use server';

import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import { customEventRuleSchema } from '~/server/db/schema/customEvents';
import { leagueSchema } from '~/server/db/schema/leagues';
import { type CustomEventRuleInsert } from '~/types/leagues';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
  * Update a league event rule
  * @param auth The authenticated league member
  * @param rule The rule to update
  * @throws an error if the user is not authorized
  * @throws an error if the rule cannot be updated
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function updateCustomEventRuleLogic(
  auth: VerifiedLeagueMemberAuth,
  rule: CustomEventRuleInsert,
  ruleId: number,
) {
  // Transaction to update the rule
  return await db.transaction(async (trx) => {
    // Get league information
    const league = await trx
      .select({
        leagueStatus: leagueSchema.status,
      })
      .from(leagueSchema)
      .where(eq(leagueSchema.leagueId, auth.leagueId))
      .then((res) => res[0]);
    if (!league) throw new Error('League not found');

    if (league.leagueStatus === 'Inactive')
      throw new Error('League rules cannot be updated while the league is inactive');

    // Error can be ignored, the where clause is not understood by the type system
    const update = await trx
      .update(customEventRuleSchema)
      .set(rule)
      .from(leagueSchema)
      .where(and(
        eq(customEventRuleSchema.leagueId, leagueSchema.leagueId),
        eq(leagueSchema.leagueId, auth.leagueId),
        eq(customEventRuleSchema.customEventRuleId, ruleId)))
      .returning({ customEventRuleId: customEventRuleSchema.customEventRuleId })
      .then(res => res[0]);

    if (!update) throw new Error('Rule not found');

    return { success: true };
  });
}
