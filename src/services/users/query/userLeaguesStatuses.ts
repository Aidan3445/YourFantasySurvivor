import 'server-only';

import { db } from '~/server/db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema, selectionUpdateSchema } from '~/server/db/schema/leagueMembers';
import { auth } from '~/lib/auth';
import { castawaySchema } from '~/server/db/schema/castaways';
import { baseEventReferenceSchema, baseEventSchema } from '~/server/db/schema/baseEvents';
import { EliminationEventNames } from '~/lib/events';
import { type LeagueMemberStatus } from '~/types/leagueMembers';

/**
  * Get the leagues that you're a member of with their statuses
  * @returns the leagues you're a member of
  * @returnObj `Record<leagueHash, LeagueMemberStatus>`
  */
export default async function getUserLeagueStatuses() {
  const { userId } = await auth();
  if (!userId) return {};

  // Get current selections with elimination status for all user's leagues
  const statuses = await db
    .select({
      leagueHash: leagueSchema.hash,
      memberId: leagueMemberSchema.memberId,
      castawayName: castawaySchema.fullName,
      castawayId: castawaySchema.castawayId,
      isEliminated: baseEventSchema.eventName
    })
    .from(leagueMemberSchema)
    .innerJoin(leagueSchema, eq(leagueSchema.leagueId, leagueMemberSchema.leagueId))
    .leftJoin(selectionUpdateSchema, and(
      eq(selectionUpdateSchema.memberId, leagueMemberSchema.memberId),
      eq(selectionUpdateSchema.episodeId,
        db.select({ maxEpisode: sql`MAX(${selectionUpdateSchema.episodeId})` })
          .from(selectionUpdateSchema)
          .where(eq(selectionUpdateSchema.memberId, leagueMemberSchema.memberId)))))
    .leftJoin(castawaySchema, eq(castawaySchema.castawayId, selectionUpdateSchema.castawayId))
    .leftJoin(baseEventReferenceSchema, and(
      eq(baseEventReferenceSchema.referenceId, castawaySchema.castawayId),
      eq(baseEventReferenceSchema.referenceType, 'Castaway')))
    .leftJoin(baseEventSchema, and(
      eq(baseEventSchema.baseEventId, baseEventReferenceSchema.baseEventId),
      inArray(baseEventSchema.eventName, EliminationEventNames)))
    .where(eq(leagueMemberSchema.userId, userId));

  return statuses.reduce((acc, status) => {
    acc[status.leagueHash] = {
      currentCastaway: status.castawayName,
      currentCastawayId: status.castawayId,
      isEliminated: status.isEliminated !== null
    };
    return acc;
  }, {} as Record<string, LeagueMemberStatus>);
}
