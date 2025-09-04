'use server';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import {
  baseEventPredictionRulesSchema, baseEventRulesSchema
} from '~/server/db/schema/baseEvents';
import { leagueSchema } from '~/server/db/schema/leagues';
import { basePredictionRulesObjectToSchema } from '~/lib/utils';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { type BaseEventPredictionRules, type BaseEventRules } from '~/types/leagues';

/**
  * Update the base event rules for a league
  * @param auth The authenticated league member
  * @param baseRules The new base event rules
  * @param predictionRules The new prediction rules
  * @throws an error if the rules cannot be updated
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function updateBaseEventRulesLogic(
  auth: VerifiedLeagueMemberAuth,
  baseRules: BaseEventRules,
  predictionRules: BaseEventPredictionRules,
) {
  return await db.transaction(async (trx) => {
    // Get league information
    const league = await trx
      .select({
        leagueId: leagueSchema.leagueId,
        status: leagueSchema.status,
      })
      .from(leagueSchema)
      .where(eq(leagueSchema.leagueId, auth.leagueId))
      .then((res) => res[0]);
    if (!league) throw new Error('League not found');

    if (league.status === 'Inactive')
      throw new Error('League rules cannot be updated while the league is inactive');

    // Create a transaction to update the rules
    await trx.insert(baseEventRulesSchema)
      .values({ ...baseRules, leagueId: league.leagueId })
      .onConflictDoUpdate({
        target: baseEventRulesSchema.leagueId,
        set: { ...baseRules },
      }).returning({ leagueId: baseEventRulesSchema.leagueId });

    const predictionSchema = basePredictionRulesObjectToSchema(predictionRules);
    await trx.insert(baseEventPredictionRulesSchema)
      .values({ ...predictionSchema, leagueId: league.leagueId })
      .onConflictDoUpdate({
        target: baseEventPredictionRulesSchema.leagueId,
        set: { ...predictionSchema },
      }).returning({ leagueId: baseEventPredictionRulesSchema.leagueId });

    if (!baseRules || !predictionRules) {
      throw new Error('Failed to update league rules');
    }

    return { success: true };
  });
}
