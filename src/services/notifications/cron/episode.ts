import 'server-only';
import { scheduleNotification } from '~/lib/qStash';

const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;

/**
 * Schedule all notifications for an episode
 * Safe to call multiple times - deduplication prevents duplicates
 * @param episodeId The episode ID (used for deduplication and episode-specific notifications)
 * @param airDate When the episode airs
 * @param runtime The episode runtime in minutes
 * @param previousEpisodeAirDate When the previous episode aired (for mid-week reminder)
 */
export async function scheduleEpisodeNotifications(
  episodeId: number,
  airDate: Date,
  runtime: number,
  previousEpisodeAirDate?: Date,
) {
  const airTime = airDate.getTime();

  // Mid-week reminder: halfway between previous episode and this one
  // Or 3 days before if no previous episode
  if (previousEpisodeAirDate) {
    const midpoint = previousEpisodeAirDate.getTime() +
      (airTime - previousEpisodeAirDate.getTime()) / 2;
    await scheduleNotification('reminder_midweek', episodeId, new Date(midpoint));
  } else {
    await scheduleNotification('reminder_midweek', episodeId, new Date(airTime - 3 * 24 * HOUR));
  }

  // 8 hours before
  await scheduleNotification('reminder_8hr', episodeId, new Date(airTime - 8 * HOUR));

  // 15 minutes before
  await scheduleNotification('reminder_15min', episodeId, new Date(airTime - 15 * MINUTE));

  // Episode starting (at air time) - for live scoring opt-in
  await scheduleNotification('episode_starting', episodeId, airDate);

  // Episode finished (air time + episode duration)
  await scheduleNotification('episode_finished', episodeId, new Date(airTime + runtime * MINUTE));
}
