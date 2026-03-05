import 'server-only';
import { type ScoringBaseEventName, type BaseEventInsert } from '~/types/events';
import { sendLiveScoringNotification } from '~/services/notifications/events/liveScoring';
import { formatEventTitle } from '~/lib/qStash';
import { ScoringBaseEventNames } from '~/lib/events';

/**
 * Send a push notification to users who have opted in for live scoring updates
 * when a new base event is created
 * @param event The base event data
 */
export async function sendBaseEventNotification(event: BaseEventInsert) {
  const title = formatEventTitle(event.eventName, event.label);

  await sendLiveScoringNotification({
    episodeId: event.episodeId,
    title,
    body: ScoringBaseEventNames.includes(event.eventName as ScoringBaseEventName)
      ? 'Tap to check your scores!'
      : 'Tap to for details!',
    data: event,
  });
}
