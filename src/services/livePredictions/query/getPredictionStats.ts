import 'server-only';

import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import {
  livePredictionSchema,
  livePredictionOptionSchema,
  livePredictionResponseSchema
} from '~/server/db/schema/livePredictions';
import { type LivePredictionUserStats } from '~/types/events';

/**
  * Calculates live prediction stats for a user, including total answered, total correct, accuracy, and streaks.
  * @param userId - the ID of the user to calculate stats for
  * @param seasonId - (optional) filter predictions by season
  * @returns an object containing the user's live prediction stats
  */
export async function getLivePredictionUserStats(
  userId: string,
  seasonId?: number,
): Promise<LivePredictionUserStats> {
  // Get all resolved responses for this user
  const responses = await db
    .select({
      livePredictionId: livePredictionResponseSchema.livePredictionId,
      optionId: livePredictionResponseSchema.optionId,
      isCorrect: livePredictionOptionSchema.isCorrect,
      resolvedAt: livePredictionSchema.resolvedAt,
    })
    .from(livePredictionResponseSchema)
    .innerJoin(
      livePredictionSchema,
      eq(livePredictionSchema.livePredictionId, livePredictionResponseSchema.livePredictionId),
    )
    .innerJoin(
      livePredictionOptionSchema,
      eq(livePredictionOptionSchema.livePredictionOptionId, livePredictionResponseSchema.optionId),
    )
    .where(and(
      eq(livePredictionResponseSchema.userId, userId),
      eq(livePredictionSchema.status, 'Resolved'),
      seasonId ? eq(livePredictionSchema.seasonId, seasonId) : undefined,
    ))
    .orderBy(livePredictionSchema.resolvedAt);

  const totalAnswered = responses.length;
  const totalCorrect = responses.filter((r) => r.isCorrect === true).length;
  const accuracy = totalAnswered > 0 ? totalCorrect / totalAnswered : 0;

  // Calculate streaks
  let currentStreak = 0;
  let bestStreak = 0;
  let streak = 0;

  for (const r of responses) {
    if (r.isCorrect) {
      streak++;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
  }
  currentStreak = streak;

  return {
    userId,
    totalAnswered,
    totalCorrect,
    accuracy,
    currentStreak,
    bestStreak,
  };
}
