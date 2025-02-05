import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { leagueMembersSchema } from '~/server/db/schema/leagueMembers';

/**
  * Authenticate the user within a league
  * @param leaguenId - the id of the league
  * @returns the user id and league id if the user is a member of the league
  * OR just the user id if the user is not a member of the league
  * OR an empty object if the user is not authenticated
  */
export async function leagueMemberAuth(leagueId: number):
  Promise<{ userId?: string, memberId?: number }> {
  const { userId } = await auth();
  if (!userId) return {};

  // Ensure the user is a member of the league
  const member = await db
    .select()
    .from(leagueMembersSchema)
    .where(and(
      eq(leagueMembersSchema.leagueId, leagueId),
      eq(leagueMembersSchema.userId, userId),
    ));

  return { userId, memberId: member[0]?.memberId };
}
