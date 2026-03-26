import 'server-only';

import { db } from '~/server/db';
import { and, eq, inArray, count, gt, not } from 'drizzle-orm';
import { leagueSchema, leagueSettingsSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema, secondaryPickSchema, selectionUpdateSchema } from '~/server/db/schema/leagueMembers';
import { baseEventReferenceSchema, baseEventSchema } from '~/server/db/schema/baseEvents';
import { castawaySchema } from '~/server/db/schema/castaways';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import getKeyEpisodes from '~/services/seasons/query/getKeyEpisodes';
import { EliminationEventNames } from '~/lib/events';
import { episodeSchema } from '~/server/db/schema/episodes';
import { scheduleSelectionChangeNotification } from '~/lib/qStash';

/**
 * Choose a castaway, either in the draft or as a selection update
 * @param auth The authenticated league member
 * @param castawayId The id of the castaway
 * @throws an error if the castaway cannot be chosen
 * @returns an object indicating success and if the draft is complete
 * @returnObj `{ success, draftComplete? }`
 */
export default async function chooseCastawayLogic(
  auth: VerifiedLeagueMemberAuth,
  castawayId: number,
) {
  if (auth.status === 'Inactive' || auth.status === 'Predraft') {
    throw new Error('League is not active');
  }

  const result = await db.transaction(async (trx) => {
    const now = new Date();

    // Find all league members (excluding current user) whose castaway was eliminated
    // within the priority window: airDate + runtime + 48h > now
    const eliminatedSelections = await trx
      .select({
        memberId: selectionUpdateSchema.memberId,
        castawayId: selectionUpdateSchema.castawayId,
        episodeId: selectionUpdateSchema.episodeId,
        airDate: episodeSchema.airDate,
        runtime: episodeSchema.runtime,
      })
      .from(baseEventReferenceSchema)
      .innerJoin(baseEventSchema, and(
        eq(baseEventSchema.baseEventId, baseEventReferenceSchema.baseEventId),
        inArray(baseEventSchema.eventName, [...EliminationEventNames]),
        eq(baseEventReferenceSchema.referenceType, 'Castaway')
      ))
      .innerJoin(episodeSchema, eq(baseEventSchema.episodeId, episodeSchema.episodeId))
      .innerJoin(selectionUpdateSchema, eq(selectionUpdateSchema.castawayId, baseEventReferenceSchema.referenceId))
      .innerJoin(leagueMemberSchema, and(
        eq(leagueMemberSchema.memberId, selectionUpdateSchema.memberId),
        eq(leagueMemberSchema.leagueId, auth.leagueId),
        not(eq(leagueMemberSchema.memberId, auth.memberId))
      ));

    // Filter to only those still within their priority window (airDate + runtime mins + 48h > now)
    const stillInWindow = eliminatedSelections.filter(({ airDate, runtime }) => {
      const windowEnd = new Date(airDate).getTime() + (runtime * 60 * 1000) + (48 * 60 * 60 * 1000);
      return windowEnd > now.getTime();
    });

    // Check if current user is themselves in the priority list — if so, skip the block entirely
    const currentUserEliminated = await trx
      .select({ memberId: selectionUpdateSchema.memberId })
      .from(baseEventReferenceSchema)
      .innerJoin(baseEventSchema, and(
        eq(baseEventSchema.baseEventId, baseEventReferenceSchema.baseEventId),
        inArray(baseEventSchema.eventName, [...EliminationEventNames]),
        eq(baseEventReferenceSchema.referenceType, 'Castaway')
      ))
      .innerJoin(episodeSchema, eq(baseEventSchema.episodeId, episodeSchema.episodeId))
      .innerJoin(selectionUpdateSchema, eq(selectionUpdateSchema.castawayId, baseEventReferenceSchema.referenceId))
      .innerJoin(leagueMemberSchema, and(
        eq(leagueMemberSchema.memberId, selectionUpdateSchema.memberId),
        eq(leagueMemberSchema.leagueId, auth.leagueId),
        eq(leagueMemberSchema.memberId, auth.memberId)
      ))
      .limit(1)
      .then(res => res.length > 0);

    if (stillInWindow.length > 0 && !currentUserEliminated) {
      // Check per-member whether they've already made a new selection after their elimination episode
      const membersMissingSelection = await Promise.all(
        stillInWindow.map(async ({ memberId, episodeId }) => {
          const hasPicked = await trx
            .select({ memberId: selectionUpdateSchema.memberId })
            .from(selectionUpdateSchema)
            .where(and(
              eq(selectionUpdateSchema.memberId, memberId),
              eq(selectionUpdateSchema.draft, false),
              gt(selectionUpdateSchema.episodeId, episodeId)
            ))
            .limit(1)
            .then(res => res.length > 0);
          return hasPicked ? null : memberId;
        })
      );

      const anyMissingSelection = membersMissingSelection.some(id => id !== null);

      if (anyMissingSelection) {
        console.error('A league member has a castaway eliminated within the priority window and has not made a new selection', {
          stillInWindow,
          membersMissingSelection,
          auth,
        });
        throw new Error('Cannot choose castaway at this time.');
      }
    }

    // Get league and validate
    const league = await trx
      .select({
        status: leagueSchema.status,
        seasonId: leagueSchema.seasonId,
        name: leagueSchema.name,
        hash: leagueSchema.hash,
        canPickOwnSurvivor: leagueSettingsSchema.secondaryPickCanPickOwn,
      })
      .from(leagueSchema)
      .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leagueSchema.leagueId))
      .where(eq(leagueSchema.leagueId, auth.leagueId))
      .then(res => res[0]);

    if (!league) throw new Error('League not found');
    if (league.status === 'Inactive') throw new Error('League is inactive');

    // Get next episode
    const { nextEpisode } = await getKeyEpisodes(league.seasonId, trx);
    console.log('[chooseCastaway] nextEpisode:', nextEpisode ? { episodeId: nextEpisode.episodeId, episodeNumber: nextEpisode.episodeNumber, airStatus: nextEpisode.airStatus, airDate: nextEpisode.airDate } : null);
    if (!nextEpisode) throw new Error('No upcoming episode found');

    // Check if castaway is eliminated
    const isEliminated = await trx
      .select({ id: baseEventSchema.baseEventId })
      .from(baseEventReferenceSchema)
      .innerJoin(baseEventSchema, and(
        eq(baseEventSchema.baseEventId, baseEventReferenceSchema.baseEventId),
        inArray(baseEventSchema.eventName, [...EliminationEventNames])
      ))
      .where(and(
        eq(baseEventReferenceSchema.referenceId, castawayId),
        eq(baseEventReferenceSchema.referenceType, 'Castaway')
      ))
      .limit(1)
      .then(res => res.length > 0);

    if (isEliminated) throw new Error('Castaway has been eliminated');

    // Verify draft order if drafting
    const isDraft = league.status === 'Draft';
    if (isDraft) {
      const pickCount = await trx
        .select({ count: count() })
        .from(selectionUpdateSchema)
        .innerJoin(leagueMemberSchema, eq(leagueMemberSchema.memberId, selectionUpdateSchema.memberId))
        .where(and(
          eq(leagueMemberSchema.leagueId, auth.leagueId),
          eq(selectionUpdateSchema.draft, true)
        ))
        .then(res => res[0]?.count ?? 0);

      const memberOrder = await trx
        .select({ draftOrder: leagueMemberSchema.draftOrder })
        .from(leagueMemberSchema)
        .where(eq(leagueMemberSchema.memberId, auth.memberId))
        .then(res => res[0]?.draftOrder);

      if (memberOrder !== pickCount) {
        console.error('Draft order mismatch', { memberOrder, pickCount });
        throw new Error('Not your turn to draft');
      }
    }

    // Make the selection
    console.log('[chooseCastaway] inserting selection:', { castawayId, memberId: auth.memberId, episodeId: nextEpisode.episodeId, draft: isDraft });
    const insertResult = await trx
      .insert(selectionUpdateSchema)
      .values({
        castawayId,
        memberId: auth.memberId,
        episodeId: nextEpisode.episodeId,
        draft: isDraft,
      })
      .onConflictDoUpdate({
        target: [selectionUpdateSchema.memberId, selectionUpdateSchema.episodeId],
        set: { castawayId },
      });
    console.log('[chooseCastaway] insert result:', insertResult);

    // Verify the row was written
    const verifyRow = await trx
      .select()
      .from(selectionUpdateSchema)
      .where(and(
        eq(selectionUpdateSchema.memberId, auth.memberId),
        eq(selectionUpdateSchema.episodeId, nextEpisode.episodeId)
      ))
      .limit(1);
    console.log('[chooseCastaway] verify row after insert:', verifyRow);

    // Secondary pick must be cleared if they are the same as primary
    if (!league.canPickOwnSurvivor) {
      await trx
        .delete(secondaryPickSchema)
        .where(and(
          eq(secondaryPickSchema.memberId, auth.memberId),
          eq(secondaryPickSchema.castawayId, castawayId),
          eq(secondaryPickSchema.episodeId, nextEpisode.episodeId)
        ));
    }

    // Check if draft is complete
    if (isDraft) {
      const totalMembers = await trx
        .select({ count: count() })
        .from(leagueMemberSchema)
        .where(eq(leagueMemberSchema.leagueId, auth.leagueId))
        .then(res => res[0]?.count ?? 0);

      const totalPicks = await trx
        .select({ count: count() })
        .from(selectionUpdateSchema)
        .innerJoin(leagueMemberSchema, eq(leagueMemberSchema.memberId, selectionUpdateSchema.memberId))
        .where(and(
          eq(leagueMemberSchema.leagueId, auth.leagueId),
          eq(selectionUpdateSchema.draft, true)
        ))
        .then(res => res[0]?.count ?? 0);

      if (totalPicks === totalMembers) {
        await trx
          .update(leagueSchema)
          .set({ status: 'Active', startWeek: nextEpisode.episodeNumber })
          .where(eq(leagueSchema.leagueId, auth.leagueId));

        return { success: true, draftComplete: true };
      }

      return { success: true };
    }

    // Active season selection — gather notification data
    const [castaway, member] = await Promise.all([
      trx
        .select({ name: castawaySchema.shortName })
        .from(castawaySchema)
        .where(eq(castawaySchema.castawayId, castawayId))
        .then((res) => res[0]),
      trx
        .select({ displayName: leagueMemberSchema.displayName })
        .from(leagueMemberSchema)
        .where(eq(leagueMemberSchema.memberId, auth.memberId))
        .then((res) => res[0]),
    ]);

    return {
      success: true,
      notify: {
        leagueId: auth.leagueId,
        leagueHash: league.hash,
        leagueName: league.name,
        userId: auth.userId,
        memberId: auth.memberId,
        memberName: member?.displayName ?? 'A member',
        castawayId,
        castawayName: castaway?.name ?? 'a castaway',
        episodeId: nextEpisode.episodeId,
      },
    };
  });

  console.log('[chooseCastaway] transaction committed, result:', JSON.stringify(result));

  // Post-transaction verification: detect silent rollback
  if ('notify' in result && result.notify) {
    const postTxnVerify = await db
      .select()
      .from(selectionUpdateSchema)
      .where(and(
        eq(selectionUpdateSchema.memberId, result.notify.memberId),
        eq(selectionUpdateSchema.episodeId, result.notify.episodeId)
      ))
      .limit(1);
    console.log('[chooseCastaway] POST-TXN verify:',
      postTxnVerify.length > 0 ? 'ROW EXISTS ✓' : 'ROW MISSING — SILENT ROLLBACK DETECTED ✗',
      { memberId: result.notify.memberId, episodeId: result.notify.episodeId }
    );

    void scheduleSelectionChangeNotification(result.notify);
  }

  return { success: result.success, draftComplete: 'draftComplete' in result ? result.draftComplete : undefined };
}
