import 'server-only';

import { auth as clerkAuth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { leagueSchema } from '~/server/db/schema/leagues';
import { systemSchema } from '~/server/db/schema/system';
import { type LeagueMemberAuth } from '~/types/api';

/**
  * Auth wrapper that utilizes session claims for merging dev and prod users
  * @returns the same auth data with the user id and sessionClaims user id merged
  */
export async function auth() {
  const res = await clerkAuth();
  return {
    ...res,
    userId: res.sessionClaims?.userId ?? res.userId,
  };
}

/**
  * Authenticate the user within a league
  * @param hash - the hash of the league
  * @returns the user id and league id if the user is a member of the league
  * OR just the user id if the user is not a member of the league
  * OR an empty object if the user is not authenticated
  * @returnObj `LeagueMemberAuth`
  */
export async function leagueMemberAuth(hash: string) {
  const { userId } = await auth();
  if (!userId) return { userId, memberId: null, role: null } as LeagueMemberAuth;

  // Ensure the user is a member of the league
  const member = await db
    .select({
      memberId: leagueMemberSchema.memberId,
      role: leagueMemberSchema.role,
    })
    .from(leagueMemberSchema)
    .innerJoin(leagueSchema, and(
      eq(leagueMemberSchema.leagueId, leagueSchema.leagueId),
      eq(leagueSchema.hash, hash)))
    .where(eq(leagueMemberSchema.userId, userId))
    .then((members) => members[0]);

  return {
    userId,
    ...member,
  } as LeagueMemberAuth;
}

/**
  * Authenticate for system admin pages
  * @returns the user id if the user is a system admin
  * OR an empty object if the user is not authenticated
  */
export async function systemAdminAuth() {
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
