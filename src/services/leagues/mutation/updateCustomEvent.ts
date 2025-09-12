import 'server-only';

import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import { customEventRuleSchema, customEventSchema } from '~/server/db/schema/customEvents';
import { leagueSchema } from '~/server/db/schema/leagues';
import { type CustomEventInsert } from '~/types/events';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
  * Update a base event for the season
  * @param auth The authenticated league member
  * @param customEventId ID of the event to update
  * @param customEvent Event to update
  * @throws if the user is not a system admin
  * @throws if the event cannot be updated
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function updateCustomEventLogic(
  auth: VerifiedLeagueMemberAuth,
  customEventId: number,
  customEvent: CustomEventInsert
) {
  if (auth.status === 'Inactive') throw new Error('League is inactive');
  // Transaction to update the event
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
      throw new Error('League events cannot be updated while the league is inactive');

    // ensure the rule is in the league
    const rule = await trx
      .select({ customEventRuleId: customEventRuleSchema.customEventRuleId })
      .from(customEventRuleSchema)
      .where(and(
        eq(customEventRuleSchema.leagueId, league.leagueId),
        eq(customEventRuleSchema.customEventRuleId, customEvent.customEventRuleId)))
      .then((res) => res[0]);
    if (!rule) throw new Error('Rule not found');

    // update the base event
    const update = await trx
      .update(customEventSchema)
      .set({
        ...customEvent,
        notes: customEvent.notes?.map(note => note.trim()).filter(note => note.length > 0),
      })
      .where(eq(customEventSchema.customEventId, customEventId))
      .returning({ customEventId: customEventSchema.customEventId })
      .then(res => res[0]);

    if (!update) throw new Error('Event not found');

    return { success: true };
  });
}
