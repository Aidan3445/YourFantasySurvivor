import 'server-only';
import { db } from '~/server/db';
import { and, eq, inArray } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { leagueSettingsSchema } from '~/server/db/schema/leagues';
import { seasonSchema } from '~/server/db/schema/seasons';
import { type LeagueMemberInsert } from '~/types/leagueMembers';
import admitMemberLogic from '~/services/leagues/mutation/admitMember';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { sendPushToUsers } from '~/services/notifications/push';

/**
 * Join a league
 * @param userId The user joining the league
 * @param hash The hash of the league
 * @param newMember The new member to add
 * @throws an error if the league cannot be found
 * @throws an error if the user is already a member of the league
 * @throws an error if the user cannot be added as a member
 * @throws an error if the league is not in the predraft status
 * @returns an object indicating success and admission if applicable
 * @returnObj `{ success: true, admitted: boolean }`
 */
export default async function joinLeagueLogic(
  userId: string,
  hash: string,
  newMember: LeagueMemberInsert,
) {
  // Transaction to join the league
  const result = await db.transaction(async (trx) => {
    const league = await trx
      .select({
        leagueId: leagueSchema.leagueId,
        name: leagueSchema.name,
        status: leagueSchema.status,
        season: seasonSchema.name,
        isProtected: leagueSettingsSchema.isProtected,
        seasonId: leagueSchema.seasonId,
        startWeek: leagueSchema.startWeek,
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
        leagueId: leagueMemberSchema.leagueId,
        displayName: leagueMemberSchema.displayName,
      })
      .onConflictDoNothing()
      .then((res) => res[0]);

    // If no member was added, the user is already a member
    if (!member?.memberId) return { success: false, admitted: true };

    if (!league.isProtected) {
      // admitMemberLogic handles both the admitted user notification
      // and the "new member joined" notification to other members
      const auth: VerifiedLeagueMemberAuth = {
        ...member,
        status: league.status,
        seasonId: league.seasonId,
        role: 'Admin',
        startWeek: league.startWeek,
      };
      return await admitMemberLogic(auth, member.memberId, trx);
    }

    // Protected: notify admins/owners of pending member
    const admins = await trx
      .selectDistinct({ userId: leagueMemberSchema.userId })
      .from(leagueMemberSchema)
      .where(and(
        eq(leagueMemberSchema.leagueId, league.leagueId),
        inArray(leagueMemberSchema.role, ['Owner', 'Admin']),
      ));

    return {
      success: true,
      admitted: false,
      notify: {
        leagueName: league.name,
        leagueHash: hash,
        memberName: member.displayName,
        userIds: admins.map((a) => a.userId),
      },
    };
  });

  // Send pending member notification outside transaction
  if ('notify' in result && result.notify && result.notify.userIds.length > 0) {
    const { leagueName, leagueHash, memberName, userIds } = result.notify;
    void sendPushToUsers(
      userIds,
      {
        title: 'Pending Member',
        body: `${memberName} wants to join ${leagueName}. Tap to review.`,
        data: { type: 'member_pending', leagueHash },
      },
      'leagueActivity',
    );
  }

  return { success: result.success, admitted: result.admitted };
}
