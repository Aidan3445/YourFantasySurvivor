import 'server-only';
import { db } from '~/server/db';
import { eq, and, isNotNull } from 'drizzle-orm';
import { episodeSchema } from '~/server/db/schema/episodes';
import { leagueSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { sendPushToUsers } from '~/services/notifications/push';
import { type Episode } from '~/types/episodes';
import { getUsersNeedingReminders } from '~/services/users/query/usersNeedingReminders';

/**
 * Validate that the scheduled episode data matches current DB state
 * Returns true if matches (notification should send), false if stale
 */
async function validateEpisode(scheduled: Episode): Promise<boolean> {
  const current = await db
    .select({
      episodeId: episodeSchema.episodeId,
      episodeNumber: episodeSchema.episodeNumber,
      title: episodeSchema.title,
      airDate: episodeSchema.airDate,
      runtime: episodeSchema.runtime,
      seasonId: episodeSchema.seasonId,
    })
    .from(episodeSchema)
    .where(eq(episodeSchema.episodeId, scheduled.episodeId))
    .then((res) => res[0]);

  if (!current) {
    console.log(
      `Skipping notification - episodeId ${scheduled.episodeId} not found`,
      { scheduled }
    );
    return false;
  }

  const scheduledAirDate = new Date(scheduled.airDate).getTime();
  const currentAirDate = new Date(current.airDate).getTime();

  if (
    scheduled.episodeNumber !== current.episodeNumber ||
    scheduled.title !== current.title ||
    scheduledAirDate !== currentAirDate ||
    scheduled.runtime !== current.runtime ||
    scheduled.seasonId !== current.seasonId
  ) {
    console.log(
      `Skipping notification - episodeId ${scheduled.episodeId} data changed since scheduling`,
      { scheduled, current }
    );
    return false;
  }

  return true;
}

/**
 * Send reminder notifications to users who haven't made predictions
 */
export async function sendReminderNotifications(
  timing: 'midweek' | '8hr' | '15min',
  episode: Episode,
) {
  if (!await validateEpisode(episode)) return;

  // Get users in active leagues for this season
  // TODO: Filter by users who haven't made predictions for this episode
  const users = await getUsersNeedingReminders(episode);

  const messages = {
    'midweek': {
      title: 'Predictions Reminder',
      body: `Don't forget to make your predictions for Episode ${episode.episodeNumber} - ${episode.title}!`,
    },
    '8hr': {
      title: 'Episode Tonight!',
      body: `Episode ${episode.episodeNumber} - ${episode.title} airs in 8 hours. Make your predictions!`,
    },
    '15min': {
      title: 'Last Chance!',
      body: `Episode ${episode.episodeNumber} - ${episode.title} starts in 15 minutes. Lock in your predictions now!`,
    },
  };

  await sendPushToUsers(
    users,
    { ...messages[timing], data: { type: 'reminder', episodeId: episode.episodeId, timing } },
    'reminders',
  );
}

/**
 * Send "episode starting" notification for live scoring opt-in
 */
export async function sendEpisodeStartingNotifications(episode: Episode) {
  if (!await validateEpisode(episode)) return;

  const users = await db
    .selectDistinct({ userId: leagueMemberSchema.userId })
    .from(leagueMemberSchema)
    .innerJoin(leagueSchema, eq(leagueSchema.leagueId, leagueMemberSchema.leagueId))
    .where(and(
      eq(leagueSchema.seasonId, episode.seasonId),
      eq(leagueSchema.status, 'Active'),
      isNotNull(leagueMemberSchema.draftOrder),
    ));

  if (users.length === 0) return;

  await sendPushToUsers(
    users.map((u) => u.userId),
    {
      title: 'Episode Starting!',
      body: `Episode ${episode.episodeNumber} - ${episode.title} is starting. Tap to enable live scoring updates.`,
      data: { type: 'live_scoring_optin', episodeId: episode.episodeId },
    },
    'liveScoring',
  );
}

/**
 * Send ambiguous "episode finished" notification
 */
export async function sendEpisodeFinishedNotifications(episode: Episode) {
  if (!await validateEpisode(episode)) return;

  const users = await db
    .selectDistinct({ userId: leagueMemberSchema.userId })
    .from(leagueMemberSchema)
    .innerJoin(leagueSchema, eq(leagueSchema.leagueId, leagueMemberSchema.leagueId))
    .where(and(
      eq(leagueSchema.seasonId, episode.seasonId),
      eq(leagueSchema.status, 'Active'),
      isNotNull(leagueMemberSchema.draftOrder),
    ));

  if (users.length === 0) return;

  await sendPushToUsers(
    users.map((u) => u.userId),
    {
      title: 'Episode Finished',
      body: 'Check your leagues to see what happened to the leaderboard!',
      data: { type: 'episode_finished', episodeId: episode.episodeId },
    },
    'episodeUpdates',
  );
}
