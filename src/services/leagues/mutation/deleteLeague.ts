import { eq } from 'drizzle-orm';
import 'server-only';

import { db } from '~/server/db';
import { leagueSchema } from '~/server/db/schema/leagues';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
 * Delete a league and all associated data
 * @param auth The authenticated league member
 * @throws if the user is not the owner of the league 
 * @throws if the league cannot be deleted
 * @returns success status
 * @retunObj `{ success: boolean }`
 */
export default async function deleteLeagueLogic(auth: VerifiedLeagueMemberAuth) {
  if (auth.role !== 'Owner') {
    throw new Error('User not authorized to delete league');
  }
  if (auth.status === 'Inactive') {
    throw new Error('League is inactive');
  }

  // Delete the league in a transaction
  return db.transaction(async (trx) => {
    // Delete the league
    await trx
      .delete(leagueSchema)
      .where(eq(leagueSchema.leagueId, auth.leagueId));

    return { success: true };
  });
}
