import 'server-only';
import { db } from '~/server/db';
import { eq, inArray, and, isNotNull } from 'drizzle-orm';
import { pushTokens, liveScoringSessionSchema } from '~/server/db/schema/notifications';
import { episodeSchema } from '~/server/db/schema/episodes';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { EXPO_PUSH_URL } from '~/lib/qStash';
import { type LiveScoringNotification } from '~/types/notifications';
import { type CustomEventInsert } from '~/types/events';

/**
 * Send a live scoring notification to users who have opted in for the episode
 * @param notification The notification content and metadata
 */
export async function sendLiveScoringNotification(notification: LiveScoringNotification) {
  const { episodeId, title, body, data, leagueId } = notification;

  if (!!leagueId && !(data as CustomEventInsert).customEventRuleId) {
    // leagueId should only be provided for custom events
    console.error('League ID provided for non-custom event live scoring notification:', {
      notification
    });
    return;
  } else if (!leagueId && (data as CustomEventInsert).customEventRuleId) {
    // Custom event needs leagueId
    console.error('Missing league ID for custom event live scoring notification:', {
      notification
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

  // Get users who opted in for this episode
  let userIds: string[];

  if (leagueId) {
    // League-specific: only users in this league who opted in
    const optedInMembers = await db
      .select({ userId: liveScoringSessionSchema.userId })
      .from(liveScoringSessionSchema)
      .innerJoin(
        leagueMemberSchema,
        eq(liveScoringSessionSchema.userId, leagueMemberSchema.userId)
      )
      .where(and(
        eq(liveScoringSessionSchema.episodeId, episodeId),
        eq(leagueMemberSchema.leagueId, leagueId),
        isNotNull(leagueMemberSchema.draftOrder)
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

  // Get push tokens for opted-in users (no preference check - they explicitly opted in)
  const tokens = await db
    .select({ token: pushTokens.token })
    .from(pushTokens)
    .where(and(
      inArray(pushTokens.userId, userIds),
      eq(pushTokens.enabled, true)
    ));

  if (tokens.length === 0) return;

  const messages = tokens.map((t) => ({
    to: t.token,
    title,
    body,
    sound: 'default' as const,
    data: {
      type: 'live_scoring',
      seasonId: episode.seasonId,
      leagueId,
      ...data,
    },
  }));

  // Send in batches of 100
  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        console.error('Expo push error:', await response.text());
      }
    } catch (error) {
      console.error('Failed to send live scoring notifications:', error);
    }
  }
}
