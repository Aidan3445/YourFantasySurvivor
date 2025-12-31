import 'server-only';

import { db } from '~/server/db';
import { and, eq, inArray } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { leagueSettingsSchema } from '~/server/db/schema/leagues';
import createNewLeagueLogic from '~/services/leagues/mutation/createNewLeague';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { baseEventPredictionRulesSchema, baseEventRulesSchema, shauhinModeSettingsSchema } from '~/server/db/schema/baseEvents';
import { customEventRuleSchema } from '~/server/db/schema/customEvents';

/**
 * Recreate a league by copying its settings and adding specified members
 * @param auth - the authenticated league member performing the action
 * @param leagueHash - the hash of the league to recreate
 * @param memberIds - array of member IDs to add to the new league in new draft order
 * @throws an error if the original league cannot be found
 * @throws an error if any member cannot be added
 * @returns the league hash of the recreated league
 * @returnObj `{ newHash }`
 */
export default async function recreateLeagueLogic(
  auth: VerifiedLeagueMemberAuth,
  memberIds: number[]
) {
  // Create the league in a transaction
  return await db.transaction(async (trx) => {
    // GATHER DATA
    // first get all the members of the original league
    const members = await trx
      .select()
      .from(leagueMemberSchema)
      .where(and(
        inArray(leagueMemberSchema.memberId, memberIds),
        eq(leagueMemberSchema.leagueId, auth.leagueId),
      ))
      .then((res) => res.toSorted((a, b) => {
        return memberIds.indexOf(a.memberId) - memberIds.indexOf(b.memberId);
      }));
    // ensure that the logged in owner is included
    const ownerMember = members.find((m) =>
      m.role === 'Owner' && m.userId === auth.userId);
    if (!ownerMember) {
      console.error('Owner member not found in members list', { members, auth });
      trx.rollback();
      throw new Error('Owner member must be included in the member IDs');
    }
    if (members.length !== memberIds.length) {
      console.error('Some members not found in original league', { members, memberIds });
      trx.rollback();
      throw new Error('Some members not found in the original league');
    }

    // Get the original league and its settings
    const originalLeague = await trx
      .select()
      .from(leagueSchema)
      .leftJoin(leagueSettingsSchema, eq(leagueSchema.leagueId, leagueSettingsSchema.leagueId))
      .leftJoin(baseEventRulesSchema, eq(leagueSchema.leagueId, baseEventRulesSchema.leagueId))
      .leftJoin(baseEventPredictionRulesSchema, eq(leagueSchema.leagueId, baseEventPredictionRulesSchema.leagueId))
      .leftJoin(shauhinModeSettingsSchema, eq(leagueSchema.leagueId, shauhinModeSettingsSchema.leagueId))
      .where(eq(leagueSchema.leagueId, auth.leagueId))
      .then((res) => res[0]);
    if (!originalLeague) {
      console.error('Original league not found', { auth });
      throw new Error('Original league not found');
    }
    const customEventRules = await trx
      .select()
      .from(customEventRuleSchema)
      .where(eq(customEventRuleSchema.leagueId, auth.leagueId));

    // RECREATE LEAGUE
    // Create the new league
    const { newHash, leagueId, memberId } = await createNewLeagueLogic(
      ownerMember.userId,
      originalLeague.league.name,
      { ...ownerMember },
      undefined,
      trx,
    );

    // set the owner's draft order to the correct value
    await trx
      .update(leagueMemberSchema)
      .set({ draftOrder: memberIds.indexOf(ownerMember.memberId) })
      .where(eq(leagueMemberSchema.memberId, memberId));

    // Add the rest of the members to the new league
    const newMembers = await trx
      .insert(leagueMemberSchema)
      .values(members
        .map((m, index) => ({
          ...m,
          leagueId: leagueId,
          draftOrder: index,
          memberId: undefined, // auto-incremented
        })))
      .onConflictDoNothing()
      .returning({ memberId: leagueMemberSchema.memberId, draftOrder: leagueMemberSchema.draftOrder });

    console.log({ newMembers });

    if (newMembers.length !== members.length - 1) {
      console.error('Failed to add all members to the new league', {
        expected: members.length - 1,
        actual: newMembers.length,
      });
      trx.rollback();
      throw new Error('Failed to add all members to the new league');
    }

    // copy league settings, but clear the draft date
    await trx
      .update(leagueSettingsSchema)
      .set({ ...originalLeague.league_settings, leagueId, draftDate: null })
      .where(eq(leagueSettingsSchema.leagueId, leagueId));

    // copy base event and prediction rules
    if (originalLeague.event_base_rule) {
      await trx
        .insert(baseEventRulesSchema)
        .values({ ...originalLeague.event_base_rule, leagueId });
    }
    if (originalLeague.event_base_prediction_rule) {
      await trx
        .insert(baseEventPredictionRulesSchema)
        .values({ ...originalLeague.event_base_prediction_rule, leagueId });
    }
    // copy shauhin mode settings
    if (originalLeague.event_shauhin_mode_settings) {
      await trx
        .insert(shauhinModeSettingsSchema)
        .values({ ...originalLeague.event_shauhin_mode_settings, leagueId });
    }
    // copy custom event and prediction rules - list insert makes if redundant here
    await trx
      .insert(customEventRuleSchema)
      .values(customEventRules.map((r) => ({ ...r, leagueId, customEventRuleId: undefined })));

    return { newHash };
  });
}

