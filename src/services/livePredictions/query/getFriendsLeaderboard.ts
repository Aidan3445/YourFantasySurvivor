import 'server-only';

import { db } from '~/server/db';
import { and, eq, exists, inArray } from 'drizzle-orm';
import {
  livePredictionSchema,
  livePredictionOptionSchema,
  livePredictionResponseSchema
} from '~/server/db/schema/livePredictions';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { leagueSchema } from '~/server/db/schema/leagues';

export async function getLivePredictionFriendsLeaderboard(userId: string, seasonId: number) {
  // Get all users in leagues with the current user (including self)
  const friendUserIds = await db
    .selectDistinct({ userId: leagueMemberSchema.userId })
    .from(leagueMemberSchema)
    .innerJoin(leagueSchema, eq(leagueSchema.leagueId, leagueMemberSchema.leagueId))
    .where(and(
      eq(leagueSchema.seasonId, seasonId),
      exists(
        db.select()
          .from(leagueMemberSchema)
          .where(and(
            eq(leagueMemberSchema.leagueId, leagueSchema.leagueId),
            eq(leagueMemberSchema.userId, userId),
          ))
      ),
    ))
    .then((res) => res.map((r) => r.userId));

  if (friendUserIds.length === 0) return [];

  console.log(`Found ${friendUserIds.length} friends for user ${userId} in season ${seasonId}`, {
    friendUserIds,
  });

  // Get resolved responses only for friends
  const responses = await db
    .select({
      userId: livePredictionResponseSchema.userId,
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
    .where(and(
      eq(livePredictionSchema.seasonId, seasonId),
      eq(livePredictionSchema.status, 'Resolved'),
      inArray(livePredictionResponseSchema.userId, friendUserIds),
    ));

  // Aggregate per user
  const userMap = new Map<string, { total: number; correct: number }>();
  for (const r of responses) {
    const entry = userMap.get(r.userId) ?? { total: 0, correct: 0 };
    entry.total++;
    if (r.isCorrect) entry.correct++;
    userMap.set(r.userId, entry);
  }

  return Array.from(userMap.entries())
    .map(([userId, { total, correct }]) => ({
      userId,
      totalAnswered: total,
      totalCorrect: correct,
      accuracy: total > 0 ? correct / total : 0,
    }))
    .sort((a, b) => b.totalCorrect - a.totalCorrect || b.accuracy - a.accuracy);
}
