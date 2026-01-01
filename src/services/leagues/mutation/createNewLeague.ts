import 'server-only';

import { db } from '~/server/db';
import { desc } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { leagueSettingsSchema } from '~/server/db/schema/leagues';
import { seasonSchema } from '~/server/db/schema/seasons';
import { type LeagueMemberInsert } from '~/types/leagueMembers';
import { type DBTransaction } from '~/types/server';

/**
 * Create a new league
 * @param userId - the user creating the league
 * @param leagueName - the league to create
 * @param newMember - the new member to add
 * @param draftDate - the draft date for the league
 * @param protected - whether the league is protected
 * @param trxOverride - optional transaction override for nesting
 * @throws an error if the league cannot be inserted
 * @throws an error if the league settings cannot be inserted
 * @throws an error if the user cannot be added as a member
 * @returns the league hash of the league created, its ID, and the member ID of the owner
 * @returnObj `{ newHash, leagueId, memberId }`
 */
export default async function createNewLeagueLogic(
  userId: string,
  leagueName: string,
  newMember: LeagueMemberInsert,
  draftDate?: Date | string,
  isProtected?: boolean,
  trxOverride?: DBTransaction
) {
  // Create the league in a transaction
  return await (trxOverride ?? db)
    .transaction(async (trx) => {
      // Get the current season
      const { seasonId } = await trx
        .select({
          seasonId: seasonSchema.seasonId,
          name: seasonSchema.name,
        })
        .from(seasonSchema)
        .orderBy(desc(seasonSchema.premiereDate))
        .then((res) => ({ ...res[0] }));
      if (!seasonId) {
        console.error('No seasons found when creating league', { leagueName, userId });
        trx.rollback();
        throw new Error('Season not found');
      }

      const insertedLeague = await trx
        .insert(leagueSchema)
        .values({ name: leagueName, seasonId })
        .returning({
          leagueId: leagueSchema.leagueId,
          hash: leagueSchema.hash,
        })
        .then((res) => res[0]);
      if (!insertedLeague) {
        console.error('Inserted league not returned', { leagueName, seasonId });
        trx.rollback();
        throw new Error('Failed to create league');
      }

      // Safe to assume the league was inserted if we got this far
      // Get the league id and hash
      const { leagueId, hash } = insertedLeague;

      // Insert the owner as a member
      const memberId = await trx
        .insert(leagueMemberSchema)
        .values({
          ...newMember,
          userId: userId,
          leagueId,
          role: 'Owner',
          draftOrder: 0,
          memberId: undefined, // auto-incremented
        })
        .returning({ memberId: leagueMemberSchema.memberId })
        .then((res) => res[0]?.memberId);
      if (!memberId) {
        console.error('Failed to insert league member', { leagueId, userId, newMember });
        trx.rollback();
        throw new Error('Failed to add user as a member');
      }

      // Insert the league settings
      await trx
        .insert(leagueSettingsSchema)
        .values({
          leagueId,
          isProtected: isProtected ?? true,
          draftDate: typeof draftDate === 'string'
            ? new Date(draftDate).toUTCString()
            : draftDate?.toUTCString()
        });

      return { newHash: hash, leagueId, memberId };
    });
}
