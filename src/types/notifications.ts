import { type BaseEventInsert, type CustomEventInsert } from '~/types/events';

export type Notifications = {
  token: string;
  platform: 'ios' | 'android';
  enabled?: boolean;
  preferences: NotificationPreferences;
};

export type NotificationPreferences = {
  reminders: boolean;
  leagueActivity: boolean;
  episodeUpdates: boolean;
  liveScoring: boolean;
};

export type PushMessage = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  sound: 'default';
  data?: Record<string, unknown>;
}

export type NotificationType =
  | 'reminder_midweek'
  | 'reminder_8hr'
  | 'reminder_15min'
  | 'episode_starting'
  | 'episode_finished'
  | 'draft_date_changed'
  | 'draft_reminder_1hr';

export type LiveScoringNotification = {
  episodeId: number;
  title: string;
  body: string;
  data: BaseEventInsert | CustomEventInsert;
  leagueId?: number; // If provided, only notify users in this league
}
