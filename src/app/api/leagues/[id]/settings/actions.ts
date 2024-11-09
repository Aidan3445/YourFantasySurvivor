'use server';
import { and, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { leagueSettings } from '~/server/db/schema/leagues';
import { leagueMembers } from '~/server/db/schema/members';
import { leagueAdminAuth } from '../score/actions';

export async function updateDraftOrder(leagueId: number, order: string[]) {
  const user = await leagueAdminAuth(leagueId);
  if (!user.userId) throw new Error('User not authenticated');

  const ids = (await Promise.all(order.map((name) => db
    .select({ id: leagueMembers.id })
    .from(leagueMembers)
    .where(and(
      eq(leagueMembers.league, leagueId),
      eq(leagueMembers.displayName, name))))))
    .map((res) => res[0]?.id) as number[];

  await db
    .update(leagueSettings)
    .set({ draftOrder: ids })
    .where(eq(leagueSettings.league, leagueId));
}
