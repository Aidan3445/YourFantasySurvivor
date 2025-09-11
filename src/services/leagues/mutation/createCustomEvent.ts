import 'server-only';

import { db } from '~/server/db';
import { and, count, eq } from 'drizzle-orm';
import { type CustomEventInsert } from '~/types/events';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { leagueSchema } from '~/server/db/schema/leagues';
import { customEventReferenceSchema, customEventRuleSchema, customEventSchema } from '~/server/db/schema/customEvents';

/**
 * Create a new custom/league event for the season
 * @param auth The authenticated league member
 * @param customEvent Event to create
 * @throws if the event cannot be created
 * @returns the id of the created event
 * @returnObj `{ newEventId }`
 */
export default async function createCustomEventLogic(
  auth: VerifiedLeagueMemberAuth,
  customEvent: CustomEventInsert
) {
  if (auth.status === 'Inactive') throw new Error('League is inactive');
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

    const eventRefs = customEvent.references.map((reference) => ({
      customEventId: newEventId,
      referenceType: reference.type,
      referenceId: reference.id,
    }));

    // insert the references
    await trx
      .insert(customEventReferenceSchema)
      .values(eventRefs);

    return { newEventId };
  });
}
