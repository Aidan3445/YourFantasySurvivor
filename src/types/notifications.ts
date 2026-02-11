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
  | 'episode_finished';
