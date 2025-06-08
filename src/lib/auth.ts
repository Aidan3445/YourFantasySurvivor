import 'server-only';

import { auth as clerkAuth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { leagueMembersSchema } from '~/server/db/schema/leagueMembers';
import { leagueSettingsSchema, leaguesSchema } from '~/server/db/schema/leagues';
import { systemSchema } from '~/server/db/schema/system';
import { type LeagueHash } from '~/server/db/defs/leagues';
import { seasonsSchema } from '~/server/db/schema/seasons';

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
  * @param leagueHash - the hash of the league
  * @returns the user id and league id if the user is a member of the league
  * OR just the user id if the user is not a member of the league
  * OR an empty object if the user is not authenticated
  */
export async function leagueMemberAuth(leagueHash: LeagueHash) {
  const { userId } = await auth();
  if (!userId) return { userId, memberId: null, role: null };

  // Ensure the user is a member of the league
  const member = await db
    .select({
      memberId: leagueMembersSchema.memberId,
      role: leagueMembersSchema.role,
      member: leagueMembersSchema,
      league: leaguesSchema,
      seasonName: seasonsSchema.seasonName,
      draftDate: leagueSettingsSchema.draftDate,
    })
    .from(leagueMembersSchema)
    .innerJoin(leaguesSchema, and(
      eq(leaguesSchema.leagueId, leagueMembersSchema.leagueId),
      eq(leaguesSchema.leagueHash, leagueHash)))
    .innerJoin(seasonsSchema, eq(seasonsSchema.seasonId, leaguesSchema.leagueSeason))
    .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId))
    .where(and(
      eq(leagueMembersSchema.userId, userId),
    )).then((members) => members[0]);

  return {
    userId,
    memberId: member?.memberId ?? null,
    role: member?.role ?? null,
    member: member?.member ?? null,
    league: member ? { ...member.league, draftDate: new Date(`${member.draftDate} Z`) } : null,
    seasonName: member?.seasonName ?? null,
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
  const isAdmin = await db
    .select()
    .from(systemSchema)
    .where(eq(systemSchema.userId, userId))
    .then((admins) => admins.length > 0);

  return { userId: isAdmin ? userId : null };
}
