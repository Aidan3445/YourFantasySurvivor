import 'server-only';

import { db } from '~/server/db';
import { liveScoringSessionSchema } from '~/server/db/schema/notifications';
import { eq, and } from 'drizzle-orm';

/**
 * Opts a user in or out of live scoring notifications for a specific episode
 * @param userId The ID of the user
 * @param episodeId The ID of the episode
 * @param optIn True to opt in, false to opt out
 */
export async function toggleLiveScoringOptIn(
  userId: string,
  episodeId: number,
  optIn: boolean,
) {
  if (optIn) {
    await db
      .insert(liveScoringSessionSchema)
      .values({ episodeId: episodeId, userId })
      .onConflictDoNothing()
      .returning();
  } else {
    await db
      .delete(liveScoringSessionSchema)
      .where(and(
        eq(liveScoringSessionSchema.episodeId, episodeId),
        eq(liveScoringSessionSchema.userId, userId)
      ));
  }
}
