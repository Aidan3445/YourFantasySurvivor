import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { type LeagueRules } from '~/types/leagues';
import { baseEventPredictionRulesSchema, baseEventRulesSchema, shauhinModeSettingsSchema } from '~/server/db/schema/baseEvents';
import { customEventRuleSchema } from '~/server/db/schema/customEvents';
import { basePredictionRulesSchemaToObject } from '~/lib/utils';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { leagueSchema, leagueSettingsSchema } from '~/server/db/schema/leagues';
import { DEFAULT_SECONDARY_PICK_MULTIPLIER } from '~/lib/leagues';

const DEFAULT_PICK_MULTIPLIER_PERCENTAGE = 100 * DEFAULT_SECONDARY_PICK_MULTIPLIER;

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
      shauhinMode: shauhinModeSettingsSchema,
      secondaryPick: {
        enabled: leagueSettingsSchema.secondaryPickEnabled,
        canPickOwnSurvivor: leagueSettingsSchema.secondaryPickCanPickOwn,
        lockoutPeriod: leagueSettingsSchema.secondaryPickLockoutPeriod,
        publicPicks: leagueSettingsSchema.secondaryPickPublicPicks,
        multiplier: leagueSettingsSchema.secondaryPickMultiplier,
      },
    })
    .from(leagueSchema)
    .leftJoin(baseEventRulesSchema, eq(baseEventRulesSchema.leagueId, leagueSchema.leagueId))
    .leftJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leagueSchema.leagueId))
    .leftJoin(baseEventPredictionRulesSchema, eq(baseEventPredictionRulesSchema.leagueId, leagueSchema.leagueId))
    .leftJoin(shauhinModeSettingsSchema, eq(shauhinModeSettingsSchema.leagueId, leagueSchema.leagueId))
    .where(eq(leagueSchema.leagueId, auth.leagueId))
    .then((rules) => ({
      ...rules[0],
      secondaryPick: {
        ...rules[0]?.secondaryPick,
        multiplier: (rules[0]?.secondaryPick?.multiplier ?? DEFAULT_PICK_MULTIPLIER_PERCENTAGE) / 100,
      },
    }));

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
    basePrediction: base?.basePrediction
      ? basePredictionRulesSchemaToObject(base.basePrediction)
      : null,
    shauhinMode: base?.shauhinMode ?? null,
    custom,
    secondaryPick: base?.secondaryPick ?? null,
  } as LeagueRules;
}
