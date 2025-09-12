import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { episodeSchema } from '~/server/db/schema/episodes';
import { leagueMemberSchema, selectionUpdateSchema } from '~/server/db/schema/leagueMembers';
import { type SelectionUpdate } from '~/types/leagueMembers';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { type SelectionTimelines } from '~/types/leagues';

/**
  * Get the selection timeline for a league
  * @param auth The authenticated league member
  * @returns castawayMembers and memberCastaways
  * - castawayMembers holds an array of which members selected each castaway each episode
  * - memberCastaways holds an array of castaways selected by each member each episode
  * @returnObj `memberCastaways: SelectionTimeline
  * castawayMembers: SelectionTimeline`
  */
export default async function getSelectionTimeline(auth: VerifiedLeagueMemberAuth) {
  const selectionUpdates = await db
    .select({
      episodeNumber: episodeSchema.episodeNumber,
      memberId: selectionUpdateSchema.memberId,
      castawayId: selectionUpdateSchema.castawayId,
      draft: selectionUpdateSchema.draft,
    })
    .from(selectionUpdateSchema)
    .innerJoin(leagueMemberSchema, eq(leagueMemberSchema.memberId, selectionUpdateSchema.memberId))
    .innerJoin(episodeSchema, eq(episodeSchema.episodeId, selectionUpdateSchema.episodeId))
    .orderBy(episodeSchema.episodeNumber)
    .where(eq(leagueMemberSchema.leagueId, auth.leagueId)) as SelectionUpdate[];

  return processSelectionTimeline(selectionUpdates);
}

/**
 * Process selection updates into memberCastaways and castawayMembers structures
 * @param selectionUpdates Array of selection updates from the database
 * @returns memberCastaways and castawayMembers structures
 */
function processSelectionTimeline(selectionUpdates: SelectionUpdate[]) {
  /** memberCastaways holds an array of castaways selected by each member each episode */
  return selectionUpdates.reduce(({ memberCastaways, castawayMembers }, row) => {
    memberCastaways[row.memberId] ??= [];
    let latestUpdateEpisode = memberCastaways[row.memberId]!.length;
    // get previous selection if it exists
    let previousSelection = memberCastaways[row.memberId]![latestUpdateEpisode - 1];

    // if the selection went back to the previous pick, ignore it
    if (previousSelection !== row.castawayId) {
      if (previousSelection !== undefined) {
        // fill in the episodes between
        memberCastaways[row.memberId]!.push(...Array(row.episodeNumber - latestUpdateEpisode)
          .fill(previousSelection) as (number | null)[]);
      }
      // add the new selection
      memberCastaways[row.memberId]!.push(row.castawayId);
      // if this is the draft selection, fill in the episodes before with null
      if (row.draft) {
        memberCastaways[row.memberId]!.unshift(...Array(row.episodeNumber - latestUpdateEpisode)
          .fill(null) as (number | null)[]);
      }
    }

    /* castawayMembers holds an array of which members selected each castaway each episode */
    castawayMembers[row.castawayId] ??= [];
    latestUpdateEpisode = castawayMembers[row.castawayId]!.length - 1;
    // get previous selection if it exists or null if this is the first time 
    // a member picked up this castaway
    const previousSelector = castawayMembers[row.castawayId]![latestUpdateEpisode] ?? null;

    // if the selector went back to the previous pick, ignore it
    if (previousSelector !== row.memberId) {
      // fill in the episodes between
      castawayMembers[row.castawayId]!.push(...Array(Math.max(row.episodeNumber - latestUpdateEpisode - 1, 0))
        .fill(previousSelector) as (number | null)[]);
      // add the new selection
      castawayMembers[row.castawayId]![row.episodeNumber] = row.memberId;

      // castaways, unlike members, can be dropped by players
      previousSelection = memberCastaways[row.memberId]![row.episodeNumber - 1];
      if (previousSelection && previousSelection !== row.castawayId) {
        // fill in the episodes between
        castawayMembers[previousSelection]!.push(...Array(Math.max(row.episodeNumber - castawayMembers[previousSelection]!.length, 0))
          .fill(row.memberId) as (number | null)[]);
        // insert the null to indicate the castaway was dropped
        castawayMembers[previousSelection]!.push(null);
      }
    }
    return { memberCastaways, castawayMembers };
  }, {
    memberCastaways: {},
    castawayMembers: {}
  } as SelectionTimelines
  );
}
