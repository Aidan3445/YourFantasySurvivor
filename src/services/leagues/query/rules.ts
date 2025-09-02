import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { type LeagueRules } from '~/types/leagues';
import { baseEventPredictionRulesSchema, baseEventRulesSchema, shauhinModeSettingsSchema } from '~/server/db/schema/baseEvents';
import { customEventRuleSchema } from '~/server/db/schema/customEvents';
import { basePredictionRulesSchemaToObject } from '~/lib/utils';

/**
   * Get a league rules by its hash
   * @param hash The hash of the league
   * @returns the league settings
   * @throws an error if the user is not authenticated
   * @returnObj `LeagueRules | undefined`
   */
export default async function getLeagueRules(hash: string) {
  const baseReq = db
    .select({
      base: baseEventRulesSchema,
      basePrediction: baseEventPredictionRulesSchema,
      shauhinMode: shauhinModeSettingsSchema
    })
    .from(leagueSchema)
    .leftJoin(baseEventRulesSchema, eq(leagueSchema.leagueId, baseEventRulesSchema.leagueId))
    .leftJoin(baseEventPredictionRulesSchema, eq(leagueSchema.leagueId, baseEventPredictionRulesSchema.leagueId))
    .leftJoin(shauhinModeSettingsSchema, eq(leagueSchema.leagueId, shauhinModeSettingsSchema.leagueId))
    .where(eq(leagueSchema.hash, hash))
    .then((rules) => rules[0]);

  const customReq = db
    .select({
      custom: customEventRuleSchema
    })
    .from(customEventRuleSchema)
    .innerJoin(leagueSchema, eq(customEventRuleSchema.leagueId, leagueSchema.leagueId))
    .where(eq(leagueSchema.hash, hash))
    .then((rules) => rules.map(r => r.custom));

  const [base, custom] = await Promise.all([baseReq, customReq]);

  if (!base) return undefined;

  return {
    base: base.base,
    basePrediction: basePredictionRulesSchemaToObject(base.basePrediction),
    shauhinMode: base.shauhinMode,
    custom
  } as LeagueRules;
}
