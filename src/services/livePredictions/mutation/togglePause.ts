import { eq, sql } from 'drizzle-orm';
import 'server-only';
import { db } from '~/server/db';

import { livePredictionSchema } from '~/server/db/schema/livePredictions';

/**
  * Toggles the paused state of a live prediction.
  * @param livePredictionId - the ID of the prediction to toggle
  * @param paused - optional boolean to explicitly set paused state
  * returns the updated prediction
  */
export async function togglePauseLivePrediction(
  livePredictionId: number,
  paused?: boolean,
) {
  const [updated] = await db
    .update(livePredictionSchema)
    .set({
      paused: paused ?? sql`NOT ${livePredictionSchema.paused}`,
    })
    .where(eq(livePredictionSchema.livePredictionId, livePredictionId))
    .returning();

  if (!updated) {
    throw new Error('Prediction not found');
  }

  return updated;
}
