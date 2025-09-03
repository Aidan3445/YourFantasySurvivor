'use server';

import { db } from '~/server/db';
import { desc } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { leagueSettingsSchema } from '~/server/db/schema/leagues';
import { seasonSchema } from '~/server/db/schema/seasons';
import { type NewLeagueMember } from '~/types/leagueMembers';

/**
 * Create a new league
 * @param userId - the user creating the league
 * @param leagueName - the league to create
 * @param newMember - the new member to add
 * @param draftDate - the draft date for the league
 * @throws an error if the league cannot be inserted
 * @throws an error if the league settings cannot be inserted
 * @throws an error if the user cannot be added as a member
 * @returns the league hash of the league created
 * @returnObj `{ newLeagueHash }`
 */
export default async function createNewLeagueLogic(
  userId: string,
  leagueName: string,
  newMember: NewLeagueMember,
  draftDate?: Date
) {
  // Create the league in a transaction
  return await db.transaction(async (trx) => {
    // Get the current season
    const { seasonId } = await trx
      .select({
        seasonId: seasonSchema.seasonId,
        name: seasonSchema.name,
      })
      .from(seasonSchema)
      .orderBy(desc(seasonSchema.premiereDate))
      .then((res) => ({ ...res[0] }));
    if (!seasonId) throw new Error('Season not found');

    const insertedLeague = await trx
      .insert(leagueSchema)
      .values({ name: leagueName, season: seasonId })
      .returning({
        leagueId: leagueSchema.leagueId,
        hash: leagueSchema.hash,
        status: leagueSchema.status,
      })
      .then((res) => res[0]);
    if (!insertedLeague) throw new Error('Failed to create league');

    // Safe to assume the league was inserted if we got this far
    // Get the league id and hash
    const { leagueId, hash } = insertedLeague;

    // Insert the owner as a member
    const memberId = await trx
      .insert(leagueMemberSchema)
      .values({ leagueId, userId: userId, ...newMember })
      .returning({ memberId: leagueMemberSchema.memberId })
      .then((res) => res[0]?.memberId);
    if (!memberId) throw new Error('Failed to add user as a member');

    // Insert the league settings
    await trx
      .insert(leagueSettingsSchema)
      .values({ leagueId, draftDate: draftDate?.toUTCString() });

    return { newLeagueHash: hash };
  });
}
