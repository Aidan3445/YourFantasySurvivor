import 'server-only';

import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import {
  livePredictionSchema,
  livePredictionOptionSchema,
  livePredictionResponseSchema
} from '~/server/db/schema/livePredictions';
import { type LivePredictionWithOptions } from '~/types/events';
import { systemAdminAuth } from '~/lib/auth';

/**
  * Fetches all live predictions for a given episode, including options and user responses.
  * @param episodeId - the episode to fetch predictions for
  * @param userId - (optional) the user ID to fetch the user's response for
  * @returns an array of live predictions with their options and user responses
  */
export async function getLivePredictionsForEpisode(
  episodeId: number,
  userId?: string,
): Promise<LivePredictionWithOptions[]> {
  const { userId: sysAdminId } = await systemAdminAuth();

  const predictions = await db
    .select()
    .from(livePredictionSchema)
    .where(and(
      eq(livePredictionSchema.episodeId, episodeId),
      // Hide paused unless admin
      sysAdminId ? undefined : eq(livePredictionSchema.paused, false),
    ))
    .orderBy(livePredictionSchema.livePredictionId);

  return await Promise.all(
    predictions.map(async (pred) => {
      const options = await db
        .select()
        .from(livePredictionOptionSchema)
        .where(eq(livePredictionOptionSchema.livePredictionId, pred.livePredictionId));

      const responses = await db
        .select()
        .from(livePredictionResponseSchema)
        .where(eq(livePredictionResponseSchema.livePredictionId, pred.livePredictionId));

      const userResponse = userId
        ? responses.find((r) => r.userId === userId) ?? null
        : null;

      return {
        ...pred,
        options,
        responses,
        userResponse,
      };
    })
  );
}
