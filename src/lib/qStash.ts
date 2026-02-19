import 'server-only';
import { Client } from '@upstash/qstash';
import { type ScheduledSelectionData, type NotificationType, type ScheduledDraftData } from '~/types/notifications';
import { type Episode } from '~/types/episodes';
import { camelToTitle } from '~/lib/utils';
import { BaseEventFullName } from '~/lib/events';

if (!process.env.QSTASH_TOKEN) {
  throw new Error('QSTASH_TOKEN is not set');
}

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN,
});

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://trialbyfiresurvivor.com';
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
  const formatted = BaseEventFullName[eventName as keyof typeof BaseEventFullName] ?? camelToTitle(eventName);

  // avoid redundancy
  if (formatted === label) return formatted;
  else if (label && formatted.includes(label)) return formatted;
  else if (label?.includes(formatted)) return label;

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
  const comboWindow = scheduledAt + 60 * 60; // delay + 1 hour

  let result;
  try {
    const isCombo = data.draftDate &&
      Math.floor(new Date(data.draftDate).getTime() / 1000) <= comboWindow;

    console.log(`Scheduling draft_date_changed for league ${data.leagueId} at ${new Date(scheduledAt * 1000).toISOString()}`, {
      data,
    });
    result = await qstash.publishJSON({
      url: `${BASE_URL}/api/notifications/scheduled`,
      body: {
        type: isCombo ? 'draft_date_changed_soon' as const : 'draft_date_changed' as const,
        draft: data,
      },
      notBefore: scheduledAt,
      deduplicationId: `draft_date_changed-${data.leagueId}`,
    });
    console.log(
      `Scheduled ${isCombo ? 'draft_date_changed_soon' : 'draft_date_changed'} for league ${data.leagueId} in ${DELAY_MINUTES} min`
    );

    // If combo, skip separate reminder
    if (isCombo) return result.messageId;
  } catch (e) {
    console.error(`Failed to schedule draft_date_changed for league ${data.leagueId}`, e,
      `Expected schedule time: ${new Date(scheduledAt * 1000).toISOString()}`,
      `Draft date: ${data.draftDate ? new Date(data.draftDate).toISOString() : 'N/A'}`);
    return null;
  }

  // Schedule 1-hour reminder if draft has a specific date
  if (data.draftDate) {
    try {
      const oneHr = await scheduleDraftReminderNotification(data);
      if (oneHr) {
        console.log(`Also scheduled draft_reminder_1hr for league ${data.leagueId}`);
      } else {
        console.log(`Did not schedule draft_reminder_1hr for league ${data.leagueId} - draft date may be too close or too far`);
      }
    } catch (e) {
      console.error(`Failed to schedule draft_reminder_1hr for league ${data.leagueId}`, e,
        `Draft date: ${new Date(data.draftDate).toISOString()}`);
    }
  }

  return result.messageId;
}

/**
  * Schedule a draft reminder notification 1 hour before the draft
* Validates draft date still matches before sending, so safe to schedule at time of draft date change
*/
export async function scheduleDraftReminderNotification(data: ScheduledDraftData, scheduledAt?: number) {
  if (!data.draftDate) return null;
  const draftTime = new Date(data.draftDate).getTime();
  const reminderAt = new Date(draftTime - 60 * 60 * 1000);
  const reminderTimestamp = Math.max(
    Math.floor(reminderAt.getTime() / 1000),
    (scheduledAt ?? -60) + 60,
  );
  if (reminderTimestamp <= Math.floor(Date.now() / 1000)) {
    console.log(`Skipping draft_reminder_1hr for league ${data.leagueId} - time has passed`, {
      reminderAt: reminderAt.toISOString(),
    });
    return null;
  } else if (reminderAt.getTime() - Date.now() > 7 * 24 * 60 * 60 * 1000) {
    console.log(`Skipping draft_reminder_1hr for league ${data.leagueId} - draft is more than 1 week away`, {
      reminderAt: reminderAt.toISOString(),
    });
    return null;
  }
  try {
    console.log(`Scheduling draft_reminder_1hr for league ${data.leagueId} at ${reminderAt.toISOString()}`, {
      data,
    });
    const result = await qstash.publishJSON({
      url: `${BASE_URL}/api/notifications/scheduled`,
      body: { type: 'draft_reminder_1hr' as const, draft: data },
      notBefore: reminderTimestamp,
      deduplicationId: `draft_reminder_1hr-${data.leagueId}-${reminderTimestamp}`,
    });
    console.log(
      `Scheduled draft_reminder_1hr for league ${data.leagueId} at ${reminderAt.toISOString()}`
    );
    return result.messageId;
  } catch (e) {
    console.error(`Failed to schedule draft_reminder_1hr for league ${data.leagueId}`, e,
      `Expected schedule time: ${reminderAt.toISOString()}`,
      `Draft date: ${data.draftDate ? new Date(data.draftDate).toISOString() : 'N/A'}`);
    return null;
  }
}

/**
 * Schedule a selection change notification with a short delay
 * If the user changes their pick multiple times, only the one
 * matching the current DB state will actually send
 */
export async function scheduleSelectionChangeNotification(data: ScheduledSelectionData) {
  const scheduledAt = Math.floor(Date.now() / 1000) + DELAY_MINUTES * 60;

  try {
    console.log(`Scheduling selection_changed for member ${data.memberId} at ${new Date(scheduledAt * 1000).toISOString()}`, {
      data,
    });
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
  } catch (e) {
    console.error(`Failed to schedule selection_changed for member ${data.memberId}`, e,
      `Expected schedule time: ${new Date(scheduledAt * 1000).toISOString()}`,
      `Selection data: ${JSON.stringify(data)}`);
    return null;
  }
}

