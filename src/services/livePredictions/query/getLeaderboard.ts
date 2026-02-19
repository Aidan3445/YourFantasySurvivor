import 'server-only';

import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import {
  livePredictionSchema,
  livePredictionOptionSchema,
  livePredictionResponseSchema,
  livePredictionLeaderboardUsernameSchema
} from '~/server/db/schema/livePredictions';

export async function getLivePredictionLeaderboard(seasonId: number) {
  // Get all resolved responses grouped by user
  const responses = await db
    .select({
      userId: livePredictionResponseSchema.userId,
      username: livePredictionLeaderboardUsernameSchema.username,
      isCorrect: livePredictionOptionSchema.isCorrect,
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
    .innerJoin(
      livePredictionLeaderboardUsernameSchema,
      eq(livePredictionLeaderboardUsernameSchema.userId, livePredictionResponseSchema.userId),
    )
    .where(and(
      eq(livePredictionSchema.seasonId, seasonId),
      eq(livePredictionSchema.status, 'Resolved'),
    ));

  // Aggregate per user
  const userMap = new Map<string, { username: string, total: number; correct: number }>();
  for (const r of responses) {
    const entry = userMap.get(r.userId) ?? { username: r.username, total: 0, correct: 0 };
    entry.total++;
    if (r.isCorrect) entry.correct++;
    userMap.set(r.userId, entry);
  }

  // Sort by correct count desc, then accuracy desc
  return Array.from(userMap.entries())
    .map(([userId, { username, total, correct }]) => ({
      userId,
      username,
      totalAnswered: total,
      totalCorrect: correct,
      accuracy: total > 0 ? correct / total : 0,
    }))
    .sort((a, b) => b.totalCorrect - a.totalCorrect || b.accuracy - a.accuracy);
}
