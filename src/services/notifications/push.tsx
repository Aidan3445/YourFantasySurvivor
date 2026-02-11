import 'server-only';
import { db } from '~/server/db';
import { pushTokens } from '~/server/db/schema/pushTokens';
import { eq, and, inArray } from 'drizzle-orm';
import { type ExpoPushMessage, type PushMessage } from '~/types/notifications';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Send a push notification to a single user (all their devices)
 * @param userId The user to notify
 * @param message The notification content
 * @param preferenceKey Optional preference to check before sending
 */
export async function sendPushToUser(
  userId: string,
  message: PushMessage,
  preferenceKey?: 'reminders' | 'leagueActivity' | 'episodeUpdates' | 'liveScoring',
) {
  const tokens = await db
    .select()
    .from(pushTokens)
    .where(and(
      eq(pushTokens.userId, userId),
      eq(pushTokens.enabled, true),
    ));

  const filteredTokens = tokens.filter((t) => {
    if (!preferenceKey) return true;
    return t.preferences?.[preferenceKey] === true;
  });

  if (filteredTokens.length === 0) return;

  await sendPushMessages(
    filteredTokens.map((t) => t.token),
    message,
  );
}

/**
 * Send a push notification to multiple users
 * @param userIds The users to notify
 * @param message The notification content
 * @param preferenceKey Optional preference to check before sending
 */
export async function sendPushToUsers(
  userIds: string[],
  message: PushMessage,
  preferenceKey?: 'reminders' | 'leagueActivity' | 'episodeUpdates' | 'liveScoring',
) {
  if (userIds.length === 0) return;

  const tokens = await db
    .select()
    .from(pushTokens)
    .where(and(
      inArray(pushTokens.userId, userIds),
      eq(pushTokens.enabled, true),
    ));

  const filteredTokens = tokens.filter((t) => {
    if (!preferenceKey) return true;
    return t.preferences?.[preferenceKey] === true;
  });

  if (filteredTokens.length === 0) return;

  await sendPushMessages(
    filteredTokens.map((t) => t.token),
    message,
  );
}

/**
 * Send push messages to Expo's push service
 * Handles batching for large numbers of tokens
 */
async function sendPushMessages(tokens: string[], message: PushMessage) {
  const messages: ExpoPushMessage[] = tokens.map((token) => ({
    to: token,
    title: message.title,
    body: message.body,
    sound: 'default',
    data: message.data,
  }));

  // Expo recommends batches of 100
  const batches = chunk(messages, 100);

  for (const batch of batches) {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        console.error('Expo push error:', await response.text());
      }
    } catch (error) {
      console.error('Failed to send push notifications:', error);
    }
  }
}

function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
