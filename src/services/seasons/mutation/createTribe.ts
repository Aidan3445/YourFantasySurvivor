import 'server-only';

import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { seasonSchema } from '~/server/db/schema/seasons';
import { type TribeInsert } from '~/types/tribes';
import { tribeSchema } from '~/server/db/schema/tribes';
import { revalidateTag } from 'next/cache';

/**
  * Create a new tribe
  * @param seasonName The season name to create the episode in
  * @param tribe The tribe to create
  * @throws if the tribe cannot be created
  * @throws if the season does not exist by that name
  * @returns The created tribe ID
  * @returnObj `{ tribeId }`
  */
export async function createTribeLogic(
  seasonName: string,
  tribe: TribeInsert
) {
  // Transaction to create the tribe
  return await db.transaction(async (trx) => {
    // Get the season ID
    const season = await trx
      .select({ seasonId: seasonSchema.seasonId })
      .from(seasonSchema)
      .where(eq(seasonSchema.name, seasonName))
      .then((res) => res[0]);
    if (!season) throw new Error('Season not found');

    // Insert the tribe
    const newTribeId = await trx
      .insert(tribeSchema)
      .values({
        ...tribe,
        seasonId: season.seasonId,
      })
      .returning({ tribeId: tribeSchema.tribeId })
      .onConflictDoUpdate({
        target: [tribeSchema.tribeName, tribeSchema.seasonId],
        set: {
          ...tribe
        }
      })
      .then((res) => res[0]?.tribeId);
    if (!newTribeId) throw new Error('Failed to create tribe');

    // Invalidate caches
    revalidateTag(`tribes-${season.seasonId}`, 'max');
    revalidateTag('seasons', 'max');

    return { newTribeId };
  });
}
