import 'server-only';

import { db } from '~/server/db';
import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { type DBTransaction } from '~/types/server';

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
  trxOverride?: DBTransaction
) {
  if (auth.role === 'Member') throw new Error('Not authorized to admit members');

  // Transaction to join the league
  return await (trxOverride ?? db)
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
        .returning({ memberId: leagueMemberSchema.memberId })
        .then((res) => res[0]?.memberId);
      if (!member) throw new Error('Failed to add user as a member');

      return { success: true, admitted: true };
    });
}
