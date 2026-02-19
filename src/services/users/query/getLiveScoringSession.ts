import 'server-only';

import { db } from '~/server/db';
import { liveScoringSessionSchema } from '~/server/db/schema/notifications';
import { eq, and } from 'drizzle-orm';

/**
 * Retrieves the live scoring session for a specific user and episode
 * @param userId The ID of the user
 * @param episodeId The ID of the episode
 * @returns The live scoring session if it exists, otherwise null
 */
export async function getLiveScoringSession(userId: string, episodeId: number) {
  const session = await db
    .select()
    .from(liveScoringSessionSchema)
    .where(and(
      eq(liveScoringSessionSchema.episodeId, episodeId),
      eq(liveScoringSessionSchema.userId, userId)
    ))
    .limit(1)
    .then((res) => res[0]);

  return session ?? null;
}
