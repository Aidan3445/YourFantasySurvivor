import { and, eq, isNull, sql } from 'drizzle-orm';
import 'server-only';

import { db } from '~/server/db';
import { livePredictionSchema, livePredictionOptionSchema } from '~/server/db/schema/livePredictions';
import { sendLivePredictionResolvedNotification } from '~/services/notifications/events/livePredictions';

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
  const { updated, correctOptions } = await db.transaction(async (trx) => {
    // Mark correct options
    if (correctOptionIds.length > 0) {
      await trx
        .update(livePredictionOptionSchema)
        .set({ isCorrect: true })
        .where(and(
          eq(livePredictionOptionSchema.livePredictionId, livePredictionId),
          sql`${livePredictionOptionSchema.livePredictionOptionId} = ANY(${correctOptionIds})`,
        ));
    }

    // Mark incorrect options
    await trx
      .update(livePredictionOptionSchema)
      .set({ isCorrect: false })
      .where(and(
        eq(livePredictionOptionSchema.livePredictionId, livePredictionId),
        isNull(livePredictionOptionSchema.isCorrect),
      ));

    // Update prediction status
    const [updated] = await trx
      .update(livePredictionSchema)
      .set({
        status: 'Resolved',
        resolvedAt: new Date(),
      })
      .where(eq(livePredictionSchema.livePredictionId, livePredictionId))
      .returning();

    if (!updated) throw new Error('Prediction not found');

    const correctOptions = await trx
      .select()
      .from(livePredictionOptionSchema)
      .where(and(
        eq(livePredictionOptionSchema.livePredictionId, livePredictionId),
        eq(livePredictionOptionSchema.isCorrect, true),
      ))
      .then((res) => res.map((opt) => opt.label));

    return { updated, correctOptions };
  });

  void sendLivePredictionResolvedNotification(updated, correctOptions);
  return updated;
}
