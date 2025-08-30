import 'server-only';

import { and, count, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { type LeagueHash, type LeagueStatus } from '~/types/leagues';
import { leagueSettingsSchema, leaguesSchema } from '~/server/db/schema/leagues';
import { seasonsSchema } from '~/server/db/schema/seasons';
import { leagueMembersSchema, selectionUpdatesSchema } from '~/server/db/schema/leagueMembers';
import { auth } from '~/lib/auth';

export const UPDATES = {
  /**
    * Update the league status
    * @param leagueHash - the hash of the league
    * @param leagueStatus - the new status of the league
    * @throws an error if the user is not authenticated
    * @throws an error if the user is not an member of the league
    * @throws an error if the league does not exist
    * @throws an error if the draft date has not passed
    */
  updateLeagueStatus: async function(leagueHash: LeagueHash, newStatus: LeagueStatus) {
    const { userId } = await auth();
    // Ensure authenticated, note member validation is part of the current state request
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const currentState = await db
      .select({
        leagueId: leaguesSchema.leagueId,
        leagueStatus: leaguesSchema.leagueStatus,
        draftDate: leagueSettingsSchema.draftDate,
        premeireDate: seasonsSchema.premiereDate,
        finaleDate: seasonsSchema.finaleDate,
        members: leagueSettingsSchema.draftOrder,
        reqesterRole: leagueMembersSchema.role,
      })
      .from(leaguesSchema)
      .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId))
      .innerJoin(seasonsSchema, eq(seasonsSchema.seasonId, leaguesSchema.leagueSeason))
      .innerJoin(leagueMembersSchema, and(
        eq(leagueMembersSchema.leagueId, leaguesSchema.leagueId),
        eq(leagueMembersSchema.userId, userId)))
      .where(eq(leaguesSchema.leagueHash, leagueHash))
      .then((leagues) => leagues[0]);

    if (!currentState) {
      throw new Error('League not found');
    }

    const draftPicks = await db
      .select({ count: count() })
      .from(selectionUpdatesSchema)
      .innerJoin(leagueMembersSchema, eq(leagueMembersSchema.memberId, selectionUpdatesSchema.memberId))
      .innerJoin(leaguesSchema, eq(leaguesSchema.leagueId, leagueMembersSchema.leagueId))
      .where(and(
        eq(leaguesSchema.leagueHash, leagueHash),
        eq(selectionUpdatesSchema.draft, true)))
      .then((picks) => picks[0]?.count ?? 0);
    // Validate the status update
    const { leagueStatus, draftDate, finaleDate } = currentState;
    const draftDatePassed = draftDate ? Date.now() > new Date(`${draftDate} Z`).getTime() : true;
    const draftComplete = draftPicks === currentState.members.length;
    const seasonOver = !finaleDate || Date.now() > new Date(`${finaleDate} Z`).getTime();

    switch (newStatus) {
      case 'Draft':
        if (leagueStatus !== 'Predraft') throw new Error('Invalid status update');
        if (!draftDatePassed && currentState.reqesterRole !== 'Owner') {
          throw new Error('Scheduled draft date has not passed');
        }
        break;
      case 'Active':
        if (leagueStatus !== 'Draft') throw new Error('Invalid status update');
        if (!draftComplete) throw new Error('Not all draft picks have been made');
        break;
      case 'Inactive':
        if (leagueStatus !== 'Active') throw new Error('Invalid status update');
        if (!seasonOver) throw new Error('Season not over');
        break;
      default:
        throw new Error('Invalid status');
    }

    // If we made it this far, update the league status
    await db.transaction(async (trx) => {
      try {
        await trx
          .update(leaguesSchema)
          .set({ leagueStatus: newStatus })
          .where(eq(leaguesSchema.leagueHash, leagueHash));

        // ensure draft date is the true draft start time
        if (newStatus === 'Draft') {
          await trx
            .update(leagueSettingsSchema)
            .set({ draftDate: new Date().toUTCString() })
            .where(eq(leagueSettingsSchema.leagueId, currentState.leagueId));
        }
      } catch (error) {
        console.error(error);
        trx.rollback();
        throw new Error('Failed to update league status');
      }
    });
  }
};
