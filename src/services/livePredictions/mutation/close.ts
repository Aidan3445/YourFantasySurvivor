import 'server-only';

import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import { livePredictionSchema } from '~/server/db/schema/livePredictions';

/**
  * Closes an open live prediction, preventing further responses and marking it as ready for resolution
  * @param livePredictionId - the ID of the prediction to close
  * @returns the updated prediction
  */
export async function closeLivePrediction(livePredictionId: number) {
  const [updated] = await db
    .update(livePredictionSchema)
    .set({
      status: 'Closed',
      closedAt: new Date(),
    })
    .where(and(
      eq(livePredictionSchema.livePredictionId, livePredictionId),
      eq(livePredictionSchema.status, 'Open'),
    ))
    .returning();

  if (!updated) throw new Error('Prediction not found or already closed');
  return updated;
}
