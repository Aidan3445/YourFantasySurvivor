import 'server-only';
import { scheduleNotification } from '~/lib/qStash';
import { type Episode } from '~/types/episodes';

const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;

/**
 * Schedule all notifications for an episode
 * @param episode The episode data
 * @param previousEpisodeAirDate When the previous episode aired (for mid-week reminder)
 */
export async function scheduleEpisodeNotifications(
  episode: Episode,
  previousEpisodeAirDate?: Date,
) {
  const airTime = new Date(episode.airDate).getTime();

  // Mid-week reminder: halfway between previous episode and this one
  // Or 3 days before if no previous episode
  if (previousEpisodeAirDate) {
    const midpoint = previousEpisodeAirDate.getTime() +
      (airTime - previousEpisodeAirDate.getTime()) / 2;
    await scheduleNotification('reminder_midweek', episode, new Date(midpoint));
  } else {
    await scheduleNotification('reminder_midweek', episode, new Date(airTime - 3 * 24 * HOUR));
  }

  // 8 hours before
  await scheduleNotification('reminder_8hr', episode, new Date(airTime - 8 * HOUR));

  // 15 minutes before
  await scheduleNotification('reminder_15min', episode, new Date(airTime - 15 * MINUTE));

  // Episode starting (at air time)
  await scheduleNotification('episode_starting', episode, new Date(airTime));

  // Episode finished (air time + runtime)
  await scheduleNotification('episode_finished', episode, new Date(airTime + episode.runtime * MINUTE));
}
