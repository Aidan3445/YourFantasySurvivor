import { and, eq, isNull, sql } from 'drizzle-orm';
import 'server-only';

import { db } from '~/server/db';
import { livePredictionSchema, livePredictionOptionSchema } from '~/server/db/schema/livePredictions';

/**
  * Resolves a live prediction by marking correct options and updating the prediction status to "Resolved"
  * @param livePredictionId - the ID of the prediction to resolve
  * @param correctOptionIds - an array of option IDs that are correct
  * @returns the updated prediction
  */
export async function resolveLivePrediction(
  livePredictionId: number,
  correctOptionIds: number[],
) {
  return await db.transaction(async (tx) => {
    // Mark correct options
    if (correctOptionIds.length > 0) {
      await tx
        .update(livePredictionOptionSchema)
        .set({ isCorrect: true })
        .where(and(
          eq(livePredictionOptionSchema.livePredictionId, livePredictionId),
          sql`${livePredictionOptionSchema.livePredictionOptionId} = ANY(${correctOptionIds})`,
        ));
    }

    // Mark incorrect options
    await tx
      .update(livePredictionOptionSchema)
      .set({ isCorrect: false })
      .where(and(
        eq(livePredictionOptionSchema.livePredictionId, livePredictionId),
        isNull(livePredictionOptionSchema.isCorrect),
      ));

    // Update prediction status
    const [updated] = await tx
      .update(livePredictionSchema)
      .set({
        status: 'Resolved',
        resolvedAt: new Date(),
      })
      .where(eq(livePredictionSchema.livePredictionId, livePredictionId))
      .returning();

    if (!updated) throw new Error('Prediction not found');
    return updated;
  });
}
