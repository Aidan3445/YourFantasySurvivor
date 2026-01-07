import 'server-only';

import { auth as clerkAuth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { and, eq, isNotNull } from 'drizzle-orm';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { leagueSchema } from '~/server/db/schema/leagues';
import { systemSchema } from '~/server/db/schema/system';
import { type VerifiedLeagueMemberAuth, type LeagueMemberAuth } from '~/types/api';
import { type LeagueMemberRole } from '~/types/leagueMembers';

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
  * Authenticate for system admin pages
  * @returns the user id if the user is a system admin
  * OR an empty object if the user is not authenticated
  */
export async function systemAdminAuth() {
  const { userId } = await auth();
  if (!userId) return { userId };

  // Ensure the user is a system admin
  const admin = await db
    .select()
    .from(systemSchema)
    .where(eq(systemSchema.userId, userId))
    .then((admins) => admins[0]);

  return { userId: admin?.userId ?? null, noRedirects: admin?.noRedirects ?? undefined };
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
  const noAuth: LeagueMemberAuth = { userId, memberId: null, role: null, leagueId: null };
  if (!userId) return noAuth;

  // Ensure the user is a member of the league
  const member = await db
    .select({
      memberId: leagueMemberSchema.memberId,
      role: leagueMemberSchema.role,
      leagueId: leagueMemberSchema.leagueId,
      status: leagueSchema.status,
      seasonId: leagueSchema.seasonId,
    })
    .from(leagueMemberSchema)
    .innerJoin(leagueSchema, and(
      eq(leagueMemberSchema.leagueId, leagueSchema.leagueId),
      eq(leagueSchema.hash, hash)))
    .where(and(
      eq(leagueMemberSchema.userId, userId),
      isNotNull(leagueMemberSchema.draftOrder)))
    .then((members) => members[0]);

  const isAdmin = (await systemAdminAuth()).userId;

  if (!member && !isAdmin) return noAuth;

  if (!member) {
    // if the user is a sys admin but not a member of the league, get league owner and return as admin
    const owner = await db
      .select({
        memberId: leagueMemberSchema.memberId,
        role: leagueMemberSchema.role,
        leagueId: leagueMemberSchema.leagueId,
        status: leagueSchema.status,
        seasonId: leagueSchema.seasonId,
      })
      .from(leagueMemberSchema)
      .innerJoin(leagueSchema, and(
        eq(leagueMemberSchema.leagueId, leagueSchema.leagueId),
        eq(leagueSchema.hash, hash)))
      .where(eq(leagueMemberSchema.role, 'Owner'))
      .then((members) => members[0]);
    if (!owner) return noAuth;
    return {
      userId,
      memberId: owner.memberId,
      role: 'Admin', // Sys admin gets admin access
      leagueId: owner.leagueId,
      status: owner.status,
      seasonId: owner.seasonId,
    } as LeagueMemberAuth;
  }

  return {
    userId,
    ...member,
  } as LeagueMemberAuth;
}

/**
 * Wrapper for server actions with general user authentication
 */
export function requireAuth<TArgs extends unknown[], TReturn>(
  handler: (_userId: string, ..._args: TArgs) => TReturn
): (...__args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs) => {
    const { userId } = await auth();
    if (!userId) throw new Error('User not authenticated');
    return handler(userId, ...args);
  };
}

function requireLeagueAuthGenerator(minimunPermissions: LeagueMemberRole) {
  return <TArgs extends unknown[], TReturn>(
    handler: (_auth: VerifiedLeagueMemberAuth, ..._args: TArgs) => TReturn
  ): (_hash: string, ...__args: TArgs) => Promise<TReturn> => {
    return async (hash: string, ...args: TArgs) => {
      const auth = await leagueMemberAuth(hash);
      if (!auth.userId) throw new Error('User not authenticated');
      if (!auth.memberId) throw new Error('Not a league member');

      switch (minimunPermissions) {
        case 'Owner':
          if (auth.role !== 'Owner') throw new Error('User not authorized');
          break;
        case 'Admin':
          if (auth.role === 'Member') throw new Error('User not authorized');
          break;
        default:
          // No additional checks for 'Member' role
          break;
      }

      const verifiedAuth = auth as VerifiedLeagueMemberAuth;
      return handler(verifiedAuth, ...args);
    };
  };
}

/**
  * Wrapper for server actions with league member authentication
  */
export const requireLeagueMemberAuth = requireLeagueAuthGenerator('Member');

/**
  * Wrapper for server actions with league admin authentication
  */
export const requireLeagueAdminAuth = requireLeagueAuthGenerator('Admin');

/**
  * Wrapper for server actions with league owner authentication
  */
export const requireLeagueOwnerAuth = requireLeagueAuthGenerator('Owner');

/**
  * Wrapper for server actions with system admin authentication
  */
export function requireSystemAdminAuth<TArgs extends unknown[], TReturn>(
  handler: (..._args: TArgs) => TReturn
): (...__args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs) => {
    const { userId } = await systemAdminAuth();
    if (!userId) throw new Error('User not authorized');
    return handler(...args);
  };
}
