import 'server-only';

import { db } from '~/server/db';
import { and, eq, inArray, count, gte, gt, not } from 'drizzle-orm';
import { leagueSchema, leagueSettingsSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema, secondaryPickSchema, selectionUpdateSchema } from '~/server/db/schema/leagueMembers';
import { baseEventReferenceSchema, baseEventSchema } from '~/server/db/schema/baseEvents';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import getKeyEpisodes from '~/services/seasons/query/getKeyEpisodes';
import { EliminationEventNames } from '~/lib/events';
import { episodeSchema } from '~/server/db/schema/episodes';

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

  return await db.transaction(async (trx) => {
    // Validate that we are not within the 48 hour priority window, with league members eliminated
    // Any league member's current selection cannot have been eliminated in an episode that aired within the last 48 hours
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

    const eliminatedSelection = await trx
      .select({
        memberId: selectionUpdateSchema.memberId,
        castawayId: selectionUpdateSchema.castawayId,
        episodeId: selectionUpdateSchema.episodeId,
      })
      .from(baseEventReferenceSchema)
      .innerJoin(baseEventSchema, and(
        eq(baseEventSchema.baseEventId, baseEventReferenceSchema.baseEventId),
        inArray(baseEventSchema.eventName, [...EliminationEventNames])
      ))
      .innerJoin(episodeSchema, eq(baseEventSchema.episodeId, episodeSchema.episodeId))
      .innerJoin(selectionUpdateSchema, eq(selectionUpdateSchema.castawayId, baseEventReferenceSchema.referenceId))
      .innerJoin(leagueMemberSchema, and(
        eq(leagueMemberSchema.memberId, selectionUpdateSchema.memberId),
        eq(leagueMemberSchema.leagueId, auth.leagueId),
        not(eq(leagueMemberSchema.memberId, auth.memberId)) // Exclude the requesting member
      ))
      .where(gte(episodeSchema.airDate, fortyEightHoursAgo));

    // Then check if they have made a new selection
    const allMadeNewSelection = await trx
      .select({ memberId: selectionUpdateSchema.memberId })
      .from(selectionUpdateSchema)
      .where(and(
        eq(selectionUpdateSchema.draft, false),
        inArray(selectionUpdateSchema.memberId, eliminatedSelection.map(es => es.memberId)),
        gt(selectionUpdateSchema.episodeId, eliminatedSelection[0]?.episodeId ?? 0)
      ))
      .then(res => res.length === eliminatedSelection.length);

    if (eliminatedSelection.length > 0 && !allMadeNewSelection) {
      console.error('A league member has a castaway eliminated within the last 48 hours and has not made a new selection', {
        eliminatedSelection,
        allMadeNewSelection,
        auth
      });
      throw new Error('Cannot choose castaway at this time.');
    }
    // Get league and validate
    const league = await trx
      .select({
        status: leagueSchema.status,
        seasonId: leagueSchema.seasonId,
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
    await trx
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

    // Secondary pick must be cleared if they are the same as primary
    // and canPickOwnSurvivor is false
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
    }

    return { success: true };
  });
}
