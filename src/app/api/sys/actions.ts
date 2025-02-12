'use server';

import { systemAdminAuth } from '~/lib/auth';
import { db } from '~/server/db';
import { type NewCastaway } from '~/server/db/defs/castaways';
import { type NewSeason } from '~/server/db/defs/seasons';
import { type NewTribe } from '~/server/db/defs/tribes';
import { castawaysSchema } from '~/server/db/schema/castaways';
import { seasonsSchema } from '~/server/db/schema/seasons';
import { tribesSchema } from '~/server/db/schema/tribes';

/**
  * Import contestants from fandom
  * @param season - the season to import
  * @param castaways - the castaways to import
  * @param tribes - the tribes to import
  */
export async function importContestants(
  season: NewSeason,
  castaways: NewCastaway[],
  tribes: NewTribe[]
) {
  const { userId } = await systemAdminAuth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Create transaction
  await db.transaction(async (trx) => {
    try {
      const { seasonName, premiereDate } = season;
      // Insert season
      const seasonId = await trx
        .insert(seasonsSchema)
        .values({ seasonName, premiereDate: premiereDate.toUTCString() })
        .returning({ seasonId: seasonsSchema.seasonId })
        .then((seasons) => seasons[0]?.seasonId);
      if (!seasonId) throw new Error('Failed to insert season');

      // Insert castaways
      await trx
        .insert(castawaysSchema)
        .values(castaways.map((castaway) => ({ ...castaway, seasonId })));

      // Insert tribes
      await trx
        .insert(tribesSchema)
        .values(tribes.map((tribe) => ({ ...tribe, seasonId })));
    } catch (error) {
      console.error('Error importing castaways:', error);
      trx.rollback();
      throw new Error('Failed to import castaways please try again');
    }
  });
}
