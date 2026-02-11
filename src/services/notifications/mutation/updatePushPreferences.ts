import 'server-only';
import { db } from '~/server/db';
import { pushTokens } from '~/server/db/schema/pushTokens';
import { eq, and } from 'drizzle-orm';
import { type Notifications } from '~/types/notifications';

/**
 * Update push notification preferences for a token
 * @param userId The authenticated user's ID
 * @param notifications Token and preferences to update
 * @throws Error if userId is not provided
 * @returns Success status
 * @returnObj `{ success }`
 */
export default async function updatePushPreferences(
  notifications: Notifications,
  userId: string,
) {
  if (!userId) throw new Error('User not authenticated');

  const { token, enabled, preferences } = notifications;

  const updateData: Partial<Notifications> = {};
  if (enabled !== undefined) updateData.enabled = enabled;
  if (preferences !== undefined) updateData.preferences = preferences;

  await db
    .update(pushTokens)
    .set(updateData)
    .where(and(
      eq(pushTokens.token, token),
      eq(pushTokens.userId, userId)
    ));

  return { success: true };
}
