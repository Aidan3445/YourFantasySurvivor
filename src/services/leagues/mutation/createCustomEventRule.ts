import 'server-only';

import { db } from '~/server/db';
import { count, eq } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { type CustomEventRuleInsert } from '~/types/leagues';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { customEventRuleSchema } from '~/server/db/schema/customEvents';

/**
 * Create a new league event rule
 * @param leagueId The ID of the league to create the rule for
 * @param rule The rule to create
 * @throws an error if the rule cannot be created
 * @returns The ID of the created rule
 * @returnObj `{ newRuleId }`
 */
export default async function createLeagueEventRuleLogic(
  auth: VerifiedLeagueMemberAuth,
  rule: CustomEventRuleInsert
) {
  if (auth.status === 'Inactive') throw new Error('League is inactive');
  // Transaction to create the rule
  return await db.transaction(async (trx) => {
    // Get league information
    const league = await trx
      .select({
        leagueId: leagueSchema.leagueId,
        leagueStatus: leagueSchema.status,
        // number of rules already in the league
        ruleCount: count(customEventRuleSchema.customEventRuleId)
      })
      .from(leagueSchema)
      .leftJoin(
        customEventRuleSchema,
        eq(leagueSchema.leagueId, customEventRuleSchema.leagueId)
      )
      .groupBy(leagueSchema.leagueId, leagueSchema.status)
      .where(eq(leagueSchema.leagueId, auth.leagueId))
      .then((res) => res[0]);
    if (!league) throw new Error('League not found');

    if (league.leagueStatus === 'Inactive')
      throw new Error('League rules cannot be created while the league is inactive');

    if (league.ruleCount >= 6)
      throw new Error('League cannot have more than 6 custom event rules');

    const newRule = await trx
      .insert(customEventRuleSchema)
      .values({ ...rule, leagueId: auth.leagueId })
      .returning({ newRuleId: customEventRuleSchema.customEventRuleId })
      .then((res) => res[0]);

    if (!newRule) throw new Error('Failed to create rule');

    return { newRuleId: newRule.newRuleId };
  });
}
