import 'server-only';
import { db } from '~/server/db';
import { eq, and, isNotNull } from 'drizzle-orm';
import { episodeSchema } from '~/server/db/schema/episodes';
import { leagueSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { sendPushToUsers } from '~/services/notifications/push';
import { getUsersNeedingReminders } from '~/services/users/query/usersNeedingReminders';

/**
 * Send reminder notifications to users who haven't made predictions
 */
export async function sendReminderNotifications(
  episodeId: number,
  timing: 'midweek' | '8hr' | '15min',
) {
  // Get episode info
  const episode = await db
    .select({
      episodeNumber: episodeSchema.episodeNumber,
      episodeTitle: episodeSchema.title,
      seasonId: episodeSchema.seasonId,
    })
    .from(episodeSchema)
    .where(eq(episodeSchema.episodeId, episodeId))
    .then((res) => res[0]);

  if (!episode) {
    console.error('Episode not found:', episodeId);
    return;
  }

  // Get users in active leagues for this season who haven't made predictions
  // and have reminders enabled
  const userIds = await getUsersNeedingReminders();
  if (userIds.length === 0) return;


  const messages = {
    'midweek': {
      title: 'Predictions Reminder',
      body: `Don't forget to make your predictions for Episode ${episode.episodeNumber} - ${episode.episodeTitle}!`,
    },
    '8hr': {
      title: 'Episode Tonight!',
      body: `Episode ${episode.episodeNumber} - ${episode.episodeTitle} airs in 8 hours. Make your predictions!`,
    },
    '15min': {
      title: 'Last Chance!',
      body: `Episode ${episode.episodeNumber} - ${episode.episodeTitle} starts in 15 minutes. Lock in your predictions now!`,
    },
  };

  await sendPushToUsers(
    userIds,
    { ...messages[timing], data: { type: 'reminder', episodeId } },
    'reminders',
  );
}

/**
 * Send "episode starting" notification for live scoring opt-in
 */
export async function sendEpisodeStartingNotifications(episodeId: number) {
  // Get episode info
  const episode = await db
    .select({
      episodeNumber: episodeSchema.episodeNumber,
      episodeTitle: episodeSchema.title,
      seasonId: episodeSchema.seasonId,
    })
    .from(episodeSchema)
    .where(eq(episodeSchema.episodeId, episodeId))
    .then((res) => res[0]);

  if (!episode) {
    console.error('Episode not found:', episodeId);
    return;
  }


  // Get users in active leagues with liveScoring enabled
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
      body: `Episode ${episode.episodeNumber} - ${episode.episodeTitle} is starting. Tap to enable live scoring updates.`,
      data: { type: 'live_scoring_optin', episodeId },
    },
    'liveScoring',
  );
}

/**
 * Send ambiguous "episode finished" notification
 */
export async function sendEpisodeFinishedNotifications(episodeId: number) {
  // Get episode info
  const episode = await db
    .select({
      episodeNumber: episodeSchema.episodeNumber,
      episodeTitle: episodeSchema.title,
      seasonId: episodeSchema.seasonId,
    })
    .from(episodeSchema)
    .where(eq(episodeSchema.episodeId, episodeId))
    .then((res) => res[0]);

  if (!episode) {
    console.error('Episode not found:', episodeId);
    return;
  }

  // Get all users in active leagues for this season
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
      data: { type: 'episode_finished', episodeId },
    },
    'episodeUpdates',
  );
}
