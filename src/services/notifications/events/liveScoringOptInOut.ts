import 'server-only';

import { db } from '~/server/db';
import { liveScoringSessionSchema } from '~/server/db/schema/notifications';
import { eq, and } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { livePredictionLeaderboardUsernameSchema } from '~/server/db/schema/livePredictions';

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
  const user = await currentUser();
  if (user?.id !== userId || !user.username) {
    throw new Error('User not authenticated');
  }


  if (optIn) {
    const result = await db
      .insert(liveScoringSessionSchema)
      .values({ episodeId: episodeId, userId })
      .onConflictDoNothing()
      .returning();

    if (result[0]) {
      // If this is a new opt-in, ensure a leaderboard user entry is created
      await db.
        insert(livePredictionLeaderboardUsernameSchema)
        .values({
          userId,
          username: user.username
        })
        .onConflictDoNothing();
    }


  } else {
    await db
      .delete(liveScoringSessionSchema)
      .where(and(
        eq(liveScoringSessionSchema.episodeId, episodeId),
        eq(liveScoringSessionSchema.userId, userId)
      ));
  }
}
