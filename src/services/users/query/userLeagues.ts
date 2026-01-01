import 'server-only';
import { db } from '~/server/db';
import { and, count, desc, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { seasonSchema } from '~/server/db/schema/seasons';
import { leagueMemberSchema, selectionUpdateSchema } from '~/server/db/schema/leagueMembers';
import { type League } from '~/types/leagues';
import { type CurrentSelection, type LeagueMember } from '~/types/leagueMembers';
import { castawaySchema } from '~/server/db/schema/castaways';
import { baseEventReferenceSchema, baseEventSchema } from '~/server/db/schema/baseEvents';
import { EliminationEventNames } from '~/lib/events';

/**
 * Get the leagues that you're a member of
* @param userId The user id of the user
 * @returns the leagues you're a member of
 * @returnObj `{League, LeagueMember, CurrentSelection, memberCount}[]`
 */
export default async function getUserLeagues(userId: string) {
  const leagues = await db
    .select({
      league: {
        leagueId: leagueSchema.leagueId,
        name: leagueSchema.name,
        hash: leagueSchema.hash,
        status: leagueSchema.status,
        season: seasonSchema.name,
        seasonId: seasonSchema.seasonId,
      },
      member: {
        memberId: leagueMemberSchema.memberId,
        displayName: leagueMemberSchema.displayName,
        color: leagueMemberSchema.color,
        role: leagueMemberSchema.role,
        draftOrder: leagueMemberSchema.draftOrder,
      },
      currentSelection: {
        castawayId: castawaySchema.castawayId,
        fullName: castawaySchema.fullName,
        isEliminated: sql<boolean>`
          CASE WHEN ${baseEventSchema.baseEventId} IS NOT NULL 
          THEN TRUE ELSE FALSE END`.as('isEliminated'),
      },
    })
    .from(leagueMemberSchema)
    .innerJoin(leagueSchema, eq(leagueSchema.leagueId, leagueMemberSchema.leagueId))
    .innerJoin(seasonSchema, eq(seasonSchema.seasonId, leagueSchema.seasonId))
    .leftJoin(castawaySchema, eq(castawaySchema.castawayId,
      db.select({ castawayId: selectionUpdateSchema.castawayId })
        .from(selectionUpdateSchema)
        .where(eq(selectionUpdateSchema.memberId, leagueMemberSchema.memberId))
        .orderBy(desc(selectionUpdateSchema.episodeId))
        .limit(1)))
    .leftJoin(baseEventSchema, and(
      inArray(baseEventSchema.eventName, EliminationEventNames),
      inArray(baseEventSchema.baseEventId,
        db.select({ baseEventId: baseEventReferenceSchema.baseEventId })
          .from(baseEventReferenceSchema)
          .where(and(
            eq(baseEventReferenceSchema.referenceId, castawaySchema.castawayId),
            eq(baseEventReferenceSchema.referenceType, 'Castaway'))))))
    .where(and(
      eq(leagueMemberSchema.userId, userId),
      isNotNull(leagueMemberSchema.draftOrder)
    ))
    .orderBy(desc(seasonSchema.premiereDate))
    .then((rows) => rows
      .map((row) => {
        if (row.currentSelection?.castawayId === null) {
          row.currentSelection = null;
        }
        return row;
      }) as {
        league: League,
        member: LeagueMember,
        currentSelection: CurrentSelection
      }[]);

  const leagueMemberCounts = await db
    .select({
      leagueId: leagueMemberSchema.leagueId,
      memberCount: count(leagueMemberSchema.memberId).as('memberCount'),
    })
    .from(leagueMemberSchema)
    .where(inArray(leagueMemberSchema.leagueId, leagues.map(l => l.league.leagueId)))
    .groupBy(leagueMemberSchema.leagueId)
    .then((rows) => {
      const map: Record<number, number> = {};
      rows.forEach(row => {
        map[row.leagueId] = Number(row.memberCount);
      });
      return map;
    });

  return leagues.map(l => ({
    ...l,
    memberCount: leagueMemberCounts[l.league.leagueId] ?? 0,
  }));
}
