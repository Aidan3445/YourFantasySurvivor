import 'server-only';

import { db } from '~/server/db';
import { seasonSchema } from '~/server/db/schema/seasons';
import { revalidateTag } from 'next/cache';

/**
  * Create a new season
* @param seasonName The season name to create
* @param premiereDate The premiere date of the season
* @param finaleDate The finale date of the season (optional)
* @throws if the season cannot be created
* @returns The created season ID
* @returnObj `{ seasonId }`
*/
export async function createSeasonLogic(
  seasonName: string,
  premiereDate: string,
  finaleDate?: string
) {
  // Transaction to create the season
  const newSeasonId = await db
    .insert(seasonSchema)
    .values({
      name: seasonName,
      premiereDate: premiereDate,
      finaleDate: finaleDate ?? null,
    })
    .returning({ seasonId: seasonSchema.seasonId })
    .onConflictDoUpdate({
      target: [seasonSchema.name],
      set: {
        premiereDate: premiereDate,
      }
    })
    .then((res) => res[0]?.seasonId);
  if (!newSeasonId) throw new Error('Failed to create season');

  // Invalidate caches
  revalidateTag('seasons', 'max');

  return { newSeasonId };
}
