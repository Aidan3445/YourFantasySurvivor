import 'server-only';

import { db } from '~/server/db';
import { and, eq, not } from 'drizzle-orm';
import { customEventSchema } from '~/server/db/schema/customEvents';
import { leagueSchema } from '~/server/db/schema/leagues';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
 * Delete a base event for the season
 * @param auth The authenticated league member
 * @param customEventId Event ID to delete
 * @throws if the user is not an admin or owner of the league
 * @throws if the event cannot be deleted
 * @returns success status
 * @retunObj `{ success: boolean }`
 */
export default async function deleteCustomEventLogic(
  auth: VerifiedLeagueMemberAuth,
  customEventId: number
) {
  if (auth.status === 'Inactive') throw new Error('League is inactive');
  if (auth.role === 'Member') {
    throw new Error('User not authorized to delete league events');
  }

  // Delete the league in a transaction
  return db.transaction(async (trx) => {
    // Get league information
    const league = await trx
      .select({
        leagueId: leagueSchema.leagueId,
      })
      .from(leagueSchema)
      .where(and(
        eq(leagueSchema.leagueId, auth.leagueId),
        not(eq(leagueSchema.status, 'Inactive'))))
      .then((res) => res[0]);
    if (!league) throw new Error('League not found');

    await trx
      .delete(customEventSchema)
      .where(eq(customEventSchema.customEventId, customEventId));

    return { success: true };
  });
}
