import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { leagueSettingsSchema } from '~/server/db/schema/leagues';
import { seasonSchema } from '~/server/db/schema/seasons';
import { type LeagueMemberInsert } from '~/types/leagueMembers';
import admitMemberLogic from '~/services/leagues/mutation/admitMember';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
  * Join a league
  * @param userId The user joining the league
  * @param hash The hash of the league
  * @param newMember The new member to add
  * @throws an error if the league cannot be found
  * @throws an error if the user is already a member of the league
  * @throws an error if the user cannot be added as a member
  * @throws an error if the league is not in the predraft status
  * @returns an object indicating success
  * @returnObj `{ success: true }`
  */
export default async function joinLeagueLogic(
  userId: string,
  hash: string,
  newMember: LeagueMemberInsert
) {
  // Transaction to join the league
  return await db.transaction(async (trx) => {
    const league = await trx
      .select({
        leagueId: leagueSchema.leagueId,
        name: leagueSchema.name,
        status: leagueSchema.status,
        season: seasonSchema.name,
        isProtected: leagueSettingsSchema.isProtected,
        seasonId: leagueSchema.seasonId
      })
      .from(leagueSchema)
      .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leagueSchema.leagueId))
      .innerJoin(seasonSchema, eq(seasonSchema.seasonId, leagueSchema.seasonId))
      .where(eq(leagueSchema.hash, hash))
      .then((leagues) => leagues[0]);

    if (!league) throw new Error('League not found');

    if (league.status !== 'Predraft') {
      throw new Error('Cannot join after the draft has started');
    }

    // Try to add the member, if there is a conflict, the user is already a member
    const member = await trx
      .insert(leagueMemberSchema)
      .values({ leagueId: league.leagueId, userId: userId, ...newMember })
      .returning({
        userId: leagueMemberSchema.userId,
        memberId: leagueMemberSchema.memberId,
        role: leagueMemberSchema.role,
        leagueId: leagueMemberSchema.leagueId
      })
      .then((res) => res[0]);

    if (!member?.memberId) throw new Error('Failed to add user as a member');

    if (!league.isProtected) {
      const auth: VerifiedLeagueMemberAuth = {
        ...member,
        status: league.status,
        seasonId: league.seasonId,
        // override role for admittance
        role: 'Admin'
      };
      return await admitMemberLogic(auth, member.memberId, trx);
    }

    return { success: true };
  });
}
