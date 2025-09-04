'use server';

import { db } from '~/server/db';
import { and, count, eq } from 'drizzle-orm';
import { type CustomEventInsert } from '~/types/events';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { leagueSchema } from '~/server/db/schema/leagues';
import { customEventRuleSchema, customEventSchema } from '~/server/db/schema/customEvents';

/**
 * Create a new custom/league event for the season
 * @param auth The authenticated league member
 * @param leagueHash Hash of the league to create the event for
 * @param customEvent Event to create
 * @throws if the event cannot be created
 * @returns the id of the created event
 * @returnObj `{ newEventId }`
 */
export default async function createCustomEventLogic(
  auth: VerifiedLeagueMemberAuth,
  customEvent: CustomEventInsert
) {
  // Create custom event in transaction
  return db.transaction(async (trx) => {
    // ensure the rule is in the league
    const rule = await trx
      .select({ count: count() })
      .from(customEventRuleSchema)
      .innerJoin(leagueSchema, eq(leagueSchema.leagueId, customEventRuleSchema.leagueId))
      .where(and(
        eq(leagueSchema.leagueId, auth.leagueId),
        eq(customEventRuleSchema.customEventRuleId, customEvent.customEventRuleId)))
      .then((result) => (result[0]?.count ?? 0) > 0);

    if (!rule) throw new Error('Rule not found');

    // insert the league event
    const newEventId = await trx
      .insert(customEventSchema)
      .values(customEvent)
      .returning({ customEventId: customEventSchema.customEventId })
      .then((result) => result[0]?.customEventId);
    if (!newEventId) throw new Error('Failed to create league event');

    return { newEventId };
  });
}
