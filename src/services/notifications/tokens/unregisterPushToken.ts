import 'server-only';
import { db } from '~/server/db';
import { pushTokens } from '~/server/db/schema/notifications';
import { eq, and } from 'drizzle-orm';

/**
 * Unregister a push notification token (e.g., on logout)
 * @param userId The authenticated user's ID
 * @param token The push token to remove
 * @throws Error if userId is not provided
 * @returns Success status
 * @returnObj `{ success }`
 */
export default async function unregisterPushToken(
  token: string,
  userId: string,
) {
  if (!userId) throw new Error('User not authenticated');

  await db
    .delete(pushTokens)
    .where(and(
      eq(pushTokens.token, token),
      eq(pushTokens.userId, userId)
    ));

  return { success: true };
}
