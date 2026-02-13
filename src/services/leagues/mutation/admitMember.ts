import 'server-only';
import { db } from '~/server/db';
import { and, eq, isNotNull, isNull, ne, sql } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { type DBTransaction } from '~/types/server';
import { sendPushToUser, sendPushToUsers } from '~/services/notifications/push';

/**
 * Admit a member to the league by giving them a draft order
 * @param hash The hash of the league
 * @param memberId The member to admit
 * @param trxOverride - optional transaction override for nesting
 * @throws an error if the league cannot be found
 * @throws an error if the member is already admitted to the league
 * @throws an error if the user cannot be added as a member
 * @throws an error if the league is not in the predraft status
 * @returns an object indicating success and admission
 * @returnObj `{ success: true, admitted: true }`
 */
export default async function admitMemberLogic(
  auth: VerifiedLeagueMemberAuth,
  memberId: number,
  trxOverride?: DBTransaction,
) {
  if (auth.role === 'Member') throw new Error('Not authorized to admit members');

  // Transaction to join the league
  const result = await (trxOverride ?? db)
    .transaction(async (trx) => {
      const draftOrder = await db
        .select({ draftOrder: sql`COALESCE(MAX(draft_order), 0) + 1` })
        .from(leagueMemberSchema)
        .innerJoin(leagueSchema, eq(leagueSchema.leagueId, leagueMemberSchema.leagueId))
        .where(and(
          eq(leagueSchema.leagueId, auth.leagueId),
          isNotNull(leagueMemberSchema.draftOrder)))
        .then(res => res[0]?.draftOrder as number | null);

      if (!draftOrder) throw new Error('Failed to determine draft order');

      // Try to add the member, if there is a conflict, the user is already a member
      const member = await trx
        .update(leagueMemberSchema)
        .set({ draftOrder })
        .where(and(
          eq(leagueMemberSchema.leagueId, auth.leagueId),
          eq(leagueMemberSchema.memberId, memberId),
          isNull(leagueMemberSchema.draftOrder)))
        .returning({
          memberId: leagueMemberSchema.memberId,
          userId: leagueMemberSchema.userId,
          displayName: leagueMemberSchema.displayName,
        })
        .then((res) => res[0]);

      if (!member) throw new Error('Failed to add user as a member');

      // Get league info for notification
      const league = await trx
        .select({ name: leagueSchema.name, hash: leagueSchema.hash })
        .from(leagueSchema)
        .where(eq(leagueSchema.leagueId, auth.leagueId))
        .then((res) => res[0]);

      // Get other admitted members for "someone joined" notification
      const otherMembers = await trx
        .selectDistinct({ userId: leagueMemberSchema.userId })
        .from(leagueMemberSchema)
        .where(and(
          eq(leagueMemberSchema.leagueId, auth.leagueId),
          isNotNull(leagueMemberSchema.draftOrder),
          ne(leagueMemberSchema.userId, member.userId),
        ));

      return {
        success: true,
        admitted: true,
        userId: member.userId,
        displayName: member.displayName,
        league,
        otherMemberUserIds: otherMembers.map((m) => m.userId),
      };
    });

  // Send notifications outside transaction
  if (result.league) {
    // Notify the admitted user
    void sendPushToUser(
      result.userId,
      {
        title: 'League Admission',
        body: `You've been admitted to ${result.league.name}!`,
        data: { type: 'league_admission', leagueHash: result.league.hash },
      },
      'leagueActivity',
    );

    // Notify other members that someone joined
    if (result.otherMemberUserIds.length > 0) {
      void sendPushToUsers(
        result.otherMemberUserIds,
        {
          title: 'New League Member!',
          body: `${result.displayName} joined ${result.league.name}!`,
          data: { type: 'member_joined', leagueHash: result.league.hash },
        },
        'leagueActivity',
      );
    }
  }

  return { success: true, admitted: true };
}
