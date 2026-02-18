import 'server-only';

import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import {
  livePredictionSchema,
  livePredictionOptionSchema,
  livePredictionResponseSchema
} from '~/server/db/schema/livePredictions';

/**
  * Records or updates a user's response to an open live prediction
  * @param livePredictionId - the ID of the prediction to respond to
  * @param optionId - the ID of the selected option
  * @param userId - the ID of the user responding
  * @returns the recorded response
  */
export async function respondToLivePrediction(
  livePredictionId: number,
  optionId: number,
  userId: string,
) {
  // Verify prediction is open and not paused
  const prediction = await db
    .select()
    .from(livePredictionSchema)
    .where(and(
      eq(livePredictionSchema.livePredictionId, livePredictionId),
      eq(livePredictionSchema.status, 'Open'),
      eq(livePredictionSchema.paused, false),
    ))
    .then((res) => res[0]);

  if (!prediction) throw new Error('Prediction is not accepting responses');

  // Verify option belongs to this prediction
  const option = await db
    .select()
    .from(livePredictionOptionSchema)
    .where(and(
      eq(livePredictionOptionSchema.livePredictionOptionId, optionId),
      eq(livePredictionOptionSchema.livePredictionId, livePredictionId),
    ))
    .then((res) => res[0]);

  if (!option) throw new Error('Invalid option for this prediction');

  // Upsert response (allows changing answer while open)
  const [response] = await db
    .insert(livePredictionResponseSchema)
    .values({ livePredictionId, optionId, userId })
    .onConflictDoUpdate({
      target: [livePredictionResponseSchema.livePredictionId, livePredictionResponseSchema.userId],
      set: { optionId },
    })
    .returning();

  return response;
}
