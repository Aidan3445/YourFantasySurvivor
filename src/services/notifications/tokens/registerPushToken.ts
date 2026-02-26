import 'server-only';
import { db } from '~/server/db';
import { pushTokens } from '~/server/db/schema/notifications';
import { eq } from 'drizzle-orm';
import { type Notifications } from '~/types/notifications';

/**
 * Register a push notification token for a user
 * @param userId The authenticated user's ID
 * @param input Token, platform, and optional preferences
 * @throws Error if userId is not provided
 * @returns Success status
 * @returnObj `{ success }`
 */
export default async function registerPushToken(
  notifications: Notifications,
  userId: string
) {
  if (!userId) throw new Error('User not authenticated');

  const { token, platform, preferences } = notifications;

  const existing = await db
    .select()
    .from(pushTokens)
    .where(
      eq(pushTokens.token, token))
    .then((res) => res[0]);

  if (existing) {
    // Update existing token (user logged out and back in, or different user on same device)
    await db
      .update(pushTokens)
      .set({
        userId,
        platform,
        enabled: true,
        preferences: preferences ?? existing.preferences,
      })
      .where(eq(pushTokens.token, token));
  } else {
    await db
      .insert(pushTokens)
      .values({
        userId,
        token,
        platform,
        enabled: true,
        preferences: preferences ?? {
          reminders: true,
          leagueActivity: true,
          episodeUpdates: true,
          liveScoring: true,
        },
      });
  }

  return { success: true };
}
