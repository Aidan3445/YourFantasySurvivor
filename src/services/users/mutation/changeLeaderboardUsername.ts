import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import 'server-only';

import { db } from '~/server/db';
import { livePredictionLeaderboardUsernameSchema } from '~/server/db/schema/livePredictions';

/**
  * Updates a user's leaderboard username for live predictions
  * @param userId - the ID of the user
  * @param newUsername - the new username to set
  * If newUsername is empty or not provided, it will default to the user's current username
  * @returns the updated leaderboard entry
  */
export async function changeLeaderboardUsername(
  userId: string,
  newUsername?: string,
) {
  let username = newUsername?.trim() ?? '';
  if (username.length === 0) {
    const user = await currentUser();
    if (!user?.username) {
      throw new Error('User not authenticated');
    }
    username = user.username;
  }

  // Upsert if newUsername is not undefined, otherwise onConflictDoNothing
  if (newUsername !== undefined) {
    const [updatedEntry] = await db
      .insert(livePredictionLeaderboardUsernameSchema)
      .values({ username, userId })
      .onConflictDoUpdate({
        target: livePredictionLeaderboardUsernameSchema.userId,
        set: { username },
      })
      .returning();

    if (!updatedEntry) {
      throw new Error('Failed to update leaderboard username');
    }
    return updatedEntry;
  } else {
    const [updatedEntry] = await db
      .insert(livePredictionLeaderboardUsernameSchema)
      .values({ username, userId })
      .onConflictDoNothing()
      .returning();

    if (!updatedEntry) {
      // If no entry was inserted, it means one already exists, so we return the existing one
      const existingEntry = await db
        .select()
        .from(livePredictionLeaderboardUsernameSchema)
        .where(eq(livePredictionLeaderboardUsernameSchema.userId, userId))
        .then((res) => res[0]);

      if (!existingEntry) {
        throw new Error('Failed to retrieve existing leaderboard username');
      }
      return existingEntry;
    }

    return updatedEntry;
  }
}
