import 'server-only';
import { type CustomEventInsert } from '~/types/events';
import { sendLiveScoringNotification } from '~/services/notifications/events/liveScoring';
import { formatEventTitle } from '~/lib/qStash';

/**
 * Send a push notification to users who have opted in for live scoring updates
 * when a new custom event is created
 * @param event The custom event data
 * @param eventName The name of the custom event (for formatting the title)
 */
export async function sendCustomEventNotification(
  event: CustomEventInsert,
  eventName: string,
  leagueId: number,
) {
  const title = formatEventTitle(eventName, event.label);

  await sendLiveScoringNotification({
    episodeId: event.episodeId,
    title,
    body: 'Tap to check your scores!',
    data: event,
    leagueId,
  });
}

