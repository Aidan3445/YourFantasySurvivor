import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { type LeagueRules } from '~/types/leagues';
import { baseEventPredictionRulesSchema, baseEventRulesSchema, shauhinModeSettingsSchema } from '~/server/db/schema/baseEvents';
import { customEventRuleSchema } from '~/server/db/schema/customEvents';
import { basePredictionRulesSchemaToObject } from '~/lib/utils';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
   * Get a league rules by its hash
   * @param auth The authenticated league member
   * @returns the league settings
   * @throws an error if the user is not authenticated
   * @returnObj `LeagueRules | undefined`
   */
export default async function getLeagueRules(auth: VerifiedLeagueMemberAuth) {
  const baseReq = db
    .select({
      base: baseEventRulesSchema,
      basePrediction: baseEventPredictionRulesSchema,
      shauhinMode: shauhinModeSettingsSchema
    })
    .from(baseEventRulesSchema)
    .leftJoin(baseEventPredictionRulesSchema, eq(baseEventPredictionRulesSchema.leagueId, baseEventRulesSchema.leagueId))
    .leftJoin(shauhinModeSettingsSchema, eq(shauhinModeSettingsSchema.leagueId, baseEventRulesSchema.leagueId))
    .where(eq(baseEventRulesSchema.leagueId, auth.leagueId))
    .then((rules) => rules[0]);

  const customReq = db
    .select({
      custom: customEventRuleSchema
    })
    .from(customEventRuleSchema)
    .where(eq(customEventRuleSchema.leagueId, auth.leagueId))
    .then((rules) => rules.map(r => r.custom));

  const [base, custom] = await Promise.all([baseReq, customReq]);

  return {
    base: base?.base ?? null,
    basePrediction: base ? basePredictionRulesSchemaToObject(base.basePrediction) : null,
    shauhinMode: base?.shauhinMode ?? null,
    custom
  } as LeagueRules;
}
