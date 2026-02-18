import { eq } from 'drizzle-orm';
import 'server-only';

import { db } from '~/server/db';
import { livePredictionSchema } from '~/server/db/schema/livePredictions';

/**
  * Deletes a live prediction and all associated options and responses.
  * @param livePredictionId - the ID of the prediction to delete
  * @returns the deleted prediction
  */
export async function deleteLivePrediction(livePredictionId: number) {
  const [deleted] = await db
    .delete(livePredictionSchema)
    .where(eq(livePredictionSchema.livePredictionId, livePredictionId))
    .returning();

  if (!deleted) throw new Error('Prediction not found');
  return deleted;
}
