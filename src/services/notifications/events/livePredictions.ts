import 'server-only';

import { sendLiveScoringNotification } from '~/services/notifications/events/liveScoring';
import { type LivePrediction } from '~/types/events';

/**
 * Send a push notification to live scoring users when a new live prediction is created
 */
export async function sendLivePredictionNotification(prediction: LivePrediction) {
  await sendLiveScoringNotification({
    episodeId: prediction.episodeId,
    title: `🔮 ${prediction.title}`,
    body: prediction.description ?? 'Make your pick now!',
    data: prediction,
  });
}

/**
 * Send a push notification when a live prediction is resolved
 */
export async function sendLivePredictionResolvedNotification(
  prediction: LivePrediction,
  correctLabels: string[],
) {
  const answerText = correctLabels.length > 0
    ? correctLabels.join(', ')
    : 'None of the options were correct';

  await sendLiveScoringNotification({
    episodeId: prediction.episodeId,
    title: `✅ ${prediction.title}`,
    body: `Results: ${answerText}. Check how you did!`,
    data: prediction,
  });
}
