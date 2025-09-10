import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { shauhinModeSettingsSchema } from '~/server/db/schema/baseEvents';
import { leagueSchema } from '~/server/db/schema/leagues';
import { type ShauhinModeSettings } from '~/types/leagues';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
  * Update the Shauhin Mode settings for a league
  * @param auth The authenticated league member
  * @param shauhinMode The new Shauhin Mode settings
  * @throws an error if the Shauhin Mode settings cannot be updated
  * @throws an error if the league is inactive
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function updateShauhinModeLogic(
  auth: VerifiedLeagueMemberAuth,
  shauhinMode: ShauhinModeSettings,
) {
  if (auth.status === 'Inactive') throw new Error('League is inactive');
  // Transaction to update the Shauhin Mode settings
  return db.transaction(async (trx) => {
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
      throw new Error('Shauhin Mode settings cannot be updated while the league is inactive');

    const update = await trx
      .insert(shauhinModeSettingsSchema)
      .values({
        leagueId: league.leagueId,
        ...shauhinMode
      })
      .onConflictDoUpdate({
        target: shauhinModeSettingsSchema.leagueId,
        set: { ...shauhinMode },
      })
      .returning({ leagueId: shauhinModeSettingsSchema.leagueId });

    if (update.length === 0) {
      throw new Error('Failed to update Shauhin Mode settings');
    }

    return { success: true };
  });
}
