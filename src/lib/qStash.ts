import { Client } from '@upstash/qstash';
import { type NotificationType } from '~/types/notifications';

if (!process.env.QSTASH_TOKEN) {
  throw new Error('QSTASH_TOKEN is not set');
}

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN,
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yourfantasysurvivor.com';

/**
 * Schedule a notification to be sent at a specific time
 * @param type The type of notification
 * @param episodeId The episode this notification is for
 * @param scheduledAt When to send the notification (Date or Unix timestamp)
 */
export async function scheduleNotification(
  type: NotificationType,
  episodeId: number,
  scheduledAt: Date | number,
) {
  const timestamp = typeof scheduledAt === 'number'
    ? scheduledAt
    : Math.floor(scheduledAt.getTime() / 1000);

  // Don't schedule if time has passed
  if (timestamp <= Math.floor(Date.now() / 1000)) {
    console.log(`Skipping ${type} for episode ${episodeId} - time has passed`);
    return null;
  }

  const messageId = await qstash.publishJSON({
    url: `${BASE_URL}/api/notifications/scheduled`,
    body: { type, episodeId },
    notBefore: timestamp,
    // Dedupe by type + episodeId so rescheduling replaces old
    deduplicationId: `${type}-${episodeId}`,
  });

  console.log(`Scheduled ${type} for episode ${episodeId} at ${new Date(timestamp * 1000).toISOString()}`);
  return messageId;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(type: NotificationType, episodeId: number) {
  try {
    await qstash.messages.delete(`${type}-${episodeId}`);
  } catch (error) {
    // Message may not exist, that's fine
    console.log(`Could not cancel ${type} for episode ${episodeId}:`, error);
  }
}
