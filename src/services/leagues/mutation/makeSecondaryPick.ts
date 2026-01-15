import 'server-only';

import { db } from '~/server/db';
import { eq, and } from 'drizzle-orm';
import { secondaryPickSchema, selectionUpdateSchema } from '~/server/db/schema/leagueMembers';
import { episodeSchema } from '~/server/db/schema/episodes';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import getKeyEpisodes from '~/services/seasons/query/getKeyEpisodes';
import { type DBTransaction } from '~/types/server';
import getLeagueRules from '~/services/leagues/query/rules';
import { MAX_SEASON_LENGTH } from '~/lib/leagues';

/**
  * Make or update a secondary pick for a league member
  * @param auth The authenticated league member
  * @param castawayId The id of the castaway
  * @param episodeId The id of the episode for which the pick is made
  * @throws an error if the secondary pick cannot be made
  * @returns an object indicating success
  * @returnObj `{ success: boolean }`
  */
export default async function makeSecondaryPick(
  auth: VerifiedLeagueMemberAuth,
  castawayId: number,
  episodeId: number
) {
  if (auth.status === 'Inactive') throw new Error('League is inactive');

  const { secondaryPick: settings } = await getLeagueRules(auth);

  if (!settings?.enabled) {
    throw new Error('Secondary picks are not enabled for this league');
  }

  return await db.transaction(async (trx) => {
    const { previousEpisode, nextEpisode } = await getKeyEpisodes(auth.seasonId, trx);

    if (previousEpisode?.airStatus === 'Airing') {
      throw new Error('Cannot make secondary pick while an episode is airing');
    }

    if (!nextEpisode) {
      console.error('No upcoming episode found for secondary pick', {
        previousEpisode,
        nextEpisode,
      });
      throw new Error('No upcoming episode found to make a secondary pick for');
    }

    if (!settings.canPickOwnSurvivor) {
      const currentSelection = await getCurrentSurvivorSelection(auth.memberId, episodeId, trx);
      if (currentSelection === castawayId) {
        throw new Error('Cannot select your current survivor as secondary pick');
      }
    }

    const lockoutViolation = await checkLockoutPeriod(
      auth.memberId,
      castawayId,
      nextEpisode?.episodeNumber ?? 0,
      settings.lockoutPeriod,
      trx
    );

    if (lockoutViolation > 0) {
      if (settings.lockoutPeriod === MAX_SEASON_LENGTH) {
        throw new Error('You have already selected this castaway as a secondary pick and cannot select them again this season');
      }

      throw new Error(`You must wait ${lockoutViolation} more episode(s) before selecting this castaway again as a secondary pick this season`);
    }

    await db
      .insert(secondaryPickSchema)
      .values({
        memberId: auth.memberId,
        episodeId,
        castawayId,
      })
      .onConflictDoUpdate({
        target: [secondaryPickSchema.memberId, secondaryPickSchema.episodeId],
        set: { castawayId },
      });

    return { success: true };
  });
};

async function getCurrentSurvivorSelection(
  memberId: number,
  episodeId: number,
  trx: DBTransaction
): Promise<number | null> {
  // Get the most recent selection update for this member at or before this episode
  const selection = await trx
    .select({
      castawayId: selectionUpdateSchema.castawayId,
    })
    .from(selectionUpdateSchema)
    .innerJoin(episodeSchema, eq(episodeSchema.episodeId, selectionUpdateSchema.episodeId))
    .where(
      and(
        eq(selectionUpdateSchema.memberId, memberId),
        eq(selectionUpdateSchema.episodeId, episodeId)
      )
    )
    .then(rows => rows[0]);

  return selection?.castawayId ?? null;
}

async function checkLockoutPeriod(
  memberId: number,
  castawayId: number,
  currentEpisode: number,
  lockoutPeriod: number,
  trx: DBTransaction
): Promise<number> {
  if (lockoutPeriod === 0) return 0;

  if (lockoutPeriod === MAX_SEASON_LENGTH) {
    // Never repeat - check if ever selected
    const previousPick = await trx
      .select()
      .from(secondaryPickSchema)
      .where(and(
        eq(secondaryPickSchema.memberId, memberId),
        eq(secondaryPickSchema.castawayId, castawayId)
      ))
      .then(rows => rows[0]);

    return previousPick ? 999 : 0; // Return large number if locked out forever
  }

  // Check last N episodes
  const recentPicks = await trx
    .select({ episodeNumber: episodeSchema.episodeNumber })
    .from(secondaryPickSchema)
    .innerJoin(episodeSchema, eq(episodeSchema.episodeId, secondaryPickSchema.episodeId))
    .where(and(
      eq(secondaryPickSchema.memberId, memberId),
      eq(secondaryPickSchema.castawayId, castawayId)
    ))
    .orderBy(episodeSchema.episodeNumber);

  const lastPickEpisode = recentPicks[recentPicks.length - 1]?.episodeNumber;
  if (!lastPickEpisode) return 0;

  const episodesSince = currentEpisode - lastPickEpisode;
  if (episodesSince < lockoutPeriod) {
    return lockoutPeriod - episodesSince;
  }

  return 0;
}
