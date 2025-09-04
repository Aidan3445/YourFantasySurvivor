'use server';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { type LeagueStatus } from '~/types/leagues';

/**
  * Update the league status to the next stage
  * Predraft -> Draft -> Active -> Inactive
  * @param auth The authenticated league member
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function updateLeagueStatusLogic(
  auth: VerifiedLeagueMemberAuth,
) {
  // Transaction to update the league settings
  return await db.transaction(async (trx) => {
    const status = await trx
      .select({ status: leagueSchema.status })
      .from(leagueSchema)
      .where(eq(leagueSchema.leagueId, auth.leagueId))
      .then((res) => res[0]?.status);

    if (!status) {
      throw new Error('League not found');
    }

    let newStatus: LeagueStatus;
    switch (status) {
      case 'Predraft':
        newStatus = 'Draft';
        break;
      case 'Draft':
        newStatus = 'Active';
        break;
      case 'Active':
        newStatus = 'Inactive';
        break;
      case 'Inactive':
        throw new Error('League is already inactive');
      default:
        throw new Error('Invalid league status');
    }

    const update = await trx
      .update(leagueSchema)
      .set({ status: newStatus })
      .where(eq(leagueSchema.leagueId, auth.leagueId))
      .returning({ status: leagueSchema.status })
      .then((res) => res[0]);

    if (!update) {
      throw new Error('Failed to update league status');
    }

    return { success: true };
  });
}
