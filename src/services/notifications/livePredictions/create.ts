import 'server-only';

import { db } from '~/server/db';
import { livePredictionSchema, livePredictionOptionSchema } from '~/server/db/schema/livePredictions';
import { type LivePredictionOptionInput } from '~/types/events';


/**
  * Creates a new live prediction with options
  * @param seasonId - the season the prediction belongs to
  * @param episodeId - the episode the prediction belongs to
  * @param title - the question being asked
  * @param description - additional context for the question
  * @param options - the answer options for the prediction
  * @returns the created prediction with its options
  */
export async function createLivePrediction(
  seasonId: number,
  episodeId: number,
  title: string,
  description: string | null,
  options: LivePredictionOptionInput[],
) {
  return await db.transaction(async (tx) => {
    const [prediction] = await tx
      .insert(livePredictionSchema)
      .values({ seasonId, episodeId, title, description })
      .returning();

    if (!prediction) throw new Error('Failed to create live prediction');

    const insertedOptions = await tx
      .insert(livePredictionOptionSchema)
      .values(options.map((opt) => ({
        livePredictionId: prediction.livePredictionId,
        label: opt.label,
        referenceType: opt.referenceType ?? null,
        referenceId: opt.referenceId ?? null,
      })))
      .returning();

    return { ...prediction, options: insertedOptions };
  });
}
