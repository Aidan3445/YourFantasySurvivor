import 'server-only';
import { db } from '~/server/db';
import { eq, and, isNotNull } from 'drizzle-orm';
import { liveScoringSessionSchema } from '~/server/db/schema/notifications';
import { episodeSchema } from '~/server/db/schema/episodes';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { sendPushToUsers } from '~/services/notifications/push';
import { type LiveScoringNotification } from '~/types/notifications';
import { type LivePrediction, type CustomEventInsert } from '~/types/events';

/**
 * Send a live scoring notification to users who have opted in for the episode
 * @param notification The notification content and metadata
 */
export async function sendLiveScoringNotification(notification: LiveScoringNotification) {
  const { episodeId, title, body, data, leagueId } = notification;

  let seasonId: number | undefined;
  let isPrediction = false;
  if ((data as LivePrediction).seasonId) {
    seasonId = (data as LivePrediction).seasonId;
    isPrediction = true;
  } else {
    if (!!leagueId && !(data as CustomEventInsert).customEventRuleId) {
      console.error('League ID provided for non-custom event live scoring notification:', {
        notification,
      });
      return;
    } else if (!leagueId && (data as CustomEventInsert).customEventRuleId) {
      console.error('Missing league ID for custom event live scoring notification:', {
        notification,
      });
      return;
    }

    // Get episode info for seasonId
    const episode = await db
      .select({ seasonId: episodeSchema.seasonId })
      .from(episodeSchema)
      .where(eq(episodeSchema.episodeId, episodeId))
      .then((res) => res[0]);

    if (!episode) {
      console.error('Episode not found for live scoring notification:', episodeId);
      return;
    }

    seasonId = episode.seasonId;
  }

  // Get users who opted in for this episode
  let userIds: string[];
  if (leagueId) {
    // League-specific: only users in this league who opted in
    const optedInMembers = await db
      .select({ userId: liveScoringSessionSchema.userId })
      .from(liveScoringSessionSchema)
      .innerJoin(
        leagueMemberSchema,
        eq(liveScoringSessionSchema.userId, leagueMemberSchema.userId),
      )
      .where(and(
        eq(liveScoringSessionSchema.episodeId, episodeId),
        eq(leagueMemberSchema.leagueId, leagueId),
        isNotNull(leagueMemberSchema.draftOrder),
      ));
    userIds = optedInMembers.map((u) => u.userId);
  } else {
    // Global: all users who opted in for this episode
    const optedInUsers = await db
      .select({ userId: liveScoringSessionSchema.userId })
      .from(liveScoringSessionSchema)
      .where(eq(liveScoringSessionSchema.episodeId, episodeId));
    userIds = optedInUsers.map((u) => u.userId);
  }

  if (userIds.length === 0) return;

  // No preferenceKey — users explicitly opted in via live scoring session
  await sendPushToUsers(
    userIds,
    {
      title,
      body,
      data: {
        type: isPrediction ? 'live_prediction' : 'live_scoring_event',
        seasonId: seasonId,
        leagueId,
        ...data,
      },
    },
  );
}
