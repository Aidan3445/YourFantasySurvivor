import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { leagueMembersSchema } from '~/server/db/schema/leagueMembers';
import { leaguesSchema } from '~/server/db/schema/leagues';
import { type LeagueMemberRole } from '~/server/db/defs/leagueMembers';
import { systemSchema } from '~/server/db/schema/system';

/**
  * Authenticate the user within a league
  * @param leagueHash - the hash of the league
  * @returns the user id and league id if the user is a member of the league
  * OR just the user id if the user is not a member of the league
  * OR an empty object if the user is not authenticated
  */
export async function leagueMemberAuth(leagueHash: string):
  Promise<{ userId: string | null, memberId: number | null, role: LeagueMemberRole | null }> {
  const { userId } = await auth();
  if (!userId) return { userId, memberId: null, role: null };

  // Ensure the user is a member of the league
  const member = await db
    .select({ memberId: leagueMembersSchema.memberId, role: leagueMembersSchema.role })
    .from(leagueMembersSchema)
    .innerJoin(leaguesSchema, eq(leaguesSchema.leagueId, leagueMembersSchema.leagueId))
    .where(and(
      eq(leaguesSchema.leagueHash, leagueHash),
      eq(leagueMembersSchema.userId, userId),
    )).then((members) => members[0]);

  return { userId, memberId: member?.memberId ?? null, role: member?.role ?? null };
}

/**
  * Authenticate for system admin pages
  * @returns the user id if the user is a system admin
  * OR an empty object if the user is not authenticated
  */
export async function systemAdminAuth(): Promise<{ userId: string | null }> {
  const { userId } = await auth();
  if (!userId) return { userId };

  // Ensure the user is a system admin
  const isAdmin = await db
    .select()
    .from(systemSchema)
    .where(eq(systemSchema.userId, userId))
    .then((admins) => admins.length > 0);

  return { userId: isAdmin ? userId : null };
}
