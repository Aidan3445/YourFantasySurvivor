import 'server-only';
import { Client } from '@upstash/qstash';
import { type NotificationType } from '~/types/notifications';
import { type Episode } from '~/types/episodes';
import { camelToTitle } from '~/lib/utils';

if (!process.env.QSTASH_TOKEN) {
  throw new Error('QSTASH_TOKEN is not set');
}

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN,
});

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yourfantasysurvivor.com';
export const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Schedule a notification to be sent at a specific time
 * @param type The type of notification
 * @param episode The episode data (validated at runtime against DB)
 * @param scheduledAt When to send the notification
 */
export async function scheduleNotification(
  type: NotificationType,
  episode: Episode,
  scheduledAt: Date | number,
) {
  const timestamp = typeof scheduledAt === 'number'
    ? scheduledAt
    : Math.floor(scheduledAt.getTime() / 1000);

  // Don't schedule if time has passed
  if (timestamp <= Math.floor(Date.now() / 1000)) {
    console.log(`Skipping ${type} for episode ${episode.episodeId} - time has passed`);
    return null;
  }

  const result = await qstash.publishJSON({
    url: `${BASE_URL}/api/notifications/scheduled`,
    body: { type, episode },
    notBefore: timestamp,
    deduplicationId: `${type}-${episode.episodeId}-${timestamp}`,
  });

  console.log(`Scheduled ${type} for episode ${episode.episodeId} at ${new Date(timestamp * 1000).toISOString()}`);
  return result.messageId;
}

/**
 * Format event name for notification title
 */
export function formatEventTitle(eventName: string, label?: string | null): string {
  const formatted = camelToTitle(eventName);
  return label ? `${formatted}: ${label}` : formatted;
}

