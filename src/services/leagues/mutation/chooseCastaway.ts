'use server';

import { db } from '~/server/db';
import { and, eq, inArray, count } from 'drizzle-orm';
import { leagueSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema, selectionUpdateSchema } from '~/server/db/schema/leagueMembers';
import { baseEventReferenceSchema, baseEventSchema } from '~/server/db/schema/baseEvents';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import getKeyEpisodes from '~/services/leagues/query/getKeyEpisodes';
import { EliminationEventNames } from '~/lib/events';

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
  return await db.transaction(async (trx) => {
    // Get league and validate
    const league = await trx
      .select({
        status: leagueSchema.status,
        seasonId: leagueSchema.season,
      })
      .from(leagueSchema)
      .where(eq(leagueSchema.leagueId, auth.leagueId))
      .then(res => res[0]);

    if (!league) throw new Error('League not found');
    if (league.status === 'Inactive') throw new Error('League is inactive');

    // Get next episode
    const { nextEpisode } = await getKeyEpisodes(league.seasonId);
    if (!nextEpisode) throw new Error('No upcoming episode found');

    // Check if castaway is eliminated
    const isEliminated = await trx
      .select({ id: baseEventSchema.baseEventId })
      .from(baseEventReferenceSchema)
      .innerJoin(baseEventSchema, and(
        eq(baseEventSchema.baseEventId, baseEventReferenceSchema.baseEventId),
        inArray(baseEventSchema.eventName, EliminationEventNames)
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
          .set({ status: 'Active' })
          .where(eq(leagueSchema.leagueId, auth.leagueId));

        return { success: true, draftComplete: true };
      }
    }

    return { success: true };
  });
}
