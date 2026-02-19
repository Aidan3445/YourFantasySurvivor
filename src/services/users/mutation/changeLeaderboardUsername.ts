import { eq } from 'drizzle-orm';
import 'server-only';

import { db } from '~/server/db';
import { livePredictionLeaderboardUsernameSchema } from '~/server/db/schema/livePredictions';

/**
  * Updates a user's leaderboard username for live predictions
  * @param userId - the ID of the user
  * @param newUsername - the new username to set
  * @returns the updated leaderboard entry
  */
export async function changeLeaderboardUsername(
  userId: string,
  newUsername: string,
) {
  const [updatedEntry] = await db
    .update(livePredictionLeaderboardUsernameSchema)
    .set({ username: newUsername })
    .where(eq(livePredictionLeaderboardUsernameSchema.userId, userId))
    .returning();

  if (!updatedEntry) {
    throw new Error('Failed to update leaderboard username');
  }

  return updatedEntry;
}
