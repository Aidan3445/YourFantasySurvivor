import 'server-only';
import { Client } from '@upstash/qstash';
import { type ScheduledSelectionData, type NotificationType, type ScheduledDraftData } from '~/types/notifications';
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
export async function scheduleEpisodeNotification(
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

const DELAY_MINUTES = 5;

/**
 * Schedule a draft date notification with a short delay
 * If the admin changes the date multiple times, only the one
 * matching the current DB state will actually send
 * @param data The league and draft date info
 */
export async function scheduleDraftDateNotification(data: ScheduledDraftData) {
  const scheduledAt = Math.floor(Date.now() / 1000) + DELAY_MINUTES * 60;

  const result = await qstash.publishJSON({
    url: `${BASE_URL}/api/notifications/scheduled`,
    body: { type: 'draft_date_changed' as const, draft: data },
    notBefore: scheduledAt,
  });

  console.log(
    `Scheduled draft_date_changed for league ${data.leagueId} in ${DELAY_MINUTES} min`
  );

  // Schedule 1-hour reminder if draft has a specific date
  if (data.draftDate) {
    const draftTime = new Date(data.draftDate).getTime();
    const reminderAt = new Date(draftTime - 60 * 60 * 1000);

    const reminderTimestamp = Math.floor(reminderAt.getTime() / 1000);
    // Don't schedule if time has passed
    if (reminderTimestamp <= Math.floor(Date.now() / 1000)) {
      console.log(`Skipping draft_reminder_1hr for league ${data.leagueId} - time has passed`, {
        reminderAt: reminderAt.toISOString(),
      });
      return null;
    }

    await qstash.publishJSON({
      url: `${BASE_URL}/api/notifications/scheduled`,
      body: { type: 'draft_reminder_1hr' as const, draft: data },
      notBefore: reminderTimestamp,
      deduplicationId: `draft_reminder_1hr-${data.leagueId}-${reminderTimestamp}`,
    });

    console.log(
      `Scheduled draft_reminder_1hr for league ${data.leagueId} at ${reminderAt.toISOString()}`
    );
  }

  return result.messageId;
}


/**
 * Schedule a selection change notification with a short delay
 * If the user changes their pick multiple times, only the one
 * matching the current DB state will actually send
 */
export async function scheduleSelectionChangeNotification(data: ScheduledSelectionData) {
  const scheduledAt = Math.floor(Date.now() / 1000) + DELAY_MINUTES * 60;

  const result = await qstash.publishJSON({
    url: `${BASE_URL}/api/notifications/scheduled`,
    body: { type: 'selection_changed' as const, selection: data },
    notBefore: scheduledAt,
    deduplicationId: `selection_changed-${data.memberId}-${data.episodeId}-${scheduledAt}`,
  });

  console.log(
    `Scheduled selection_changed for member ${data.memberId} in ${DELAY_MINUTES} min`
  );
  return result.messageId;
}

