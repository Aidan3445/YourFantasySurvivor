import { and, desc, eq, lt } from 'drizzle-orm';
import 'server-only';
import { scheduleEpisodeNotification } from '~/lib/qStash';
import { db } from '~/server/db';
import { episodeSchema } from '~/server/db/schema/episodes';
import { type Episode } from '~/types/episodes';

const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;

/**
 * Schedule all notifications for an episode
 * @param episode The episode data
 */
export async function scheduleEpisodeNotifications(episode: Episode) {
  // Get previous episode's air date for mid-week reminder timing
  const previousEpisodeAirDate = await db
    .select({ airDate: episodeSchema.airDate })
    .from(episodeSchema)
    .where(and(
      eq(episodeSchema.seasonId, episode.seasonId),
      lt(episodeSchema.episodeNumber, episode.episodeNumber)
    ))
    .orderBy(desc(episodeSchema.episodeNumber))
    .limit(1)
    .then((res) => res[0]?.airDate ? new Date(`${res[0].airDate} Z`) : undefined);

  const airTime = new Date(episode.airDate).getTime();

  // Mid-week reminder: halfway between previous episode and this one
  // Or 3 days before if no previous episode
  try {
    if (previousEpisodeAirDate) {
      const midpoint = previousEpisodeAirDate.getTime() +
        (airTime - previousEpisodeAirDate.getTime()) / 2;
      await scheduleEpisodeNotification('reminder_midweek', episode, new Date(midpoint));
    } else {
      await scheduleEpisodeNotification('reminder_midweek', episode, new Date(airTime - 3 * 24 * HOUR));
    }
  } catch (e) {
    console.error('Failed to schedule mid-week reminder', e,
      `Expected schedule time: ${previousEpisodeAirDate ? new Date(previousEpisodeAirDate.getTime() + (airTime - previousEpisodeAirDate.getTime()) / 2).toISOString() : new Date(airTime - 3 * 24 * HOUR).toISOString()}`,
      `Episode air time: ${new Date(airTime).toISOString()}`,
      `Previous episode air time: ${previousEpisodeAirDate ? new Date(previousEpisodeAirDate.getTime()).toISOString() : 'N/A'}`);
  }

  // 8 hours before
  try {
    await scheduleEpisodeNotification('reminder_8hr', episode, new Date(airTime - 8 * HOUR));
  } catch (e) {
    console.error('Failed to schedule 8hr reminder', e,
      `Expected schedule time: ${new Date(airTime - 8 * HOUR).toISOString()}`,
      `Episode air time: ${new Date(airTime).toISOString()}`,
      `Previous episode air time: ${previousEpisodeAirDate ? new Date(previousEpisodeAirDate.getTime()).toISOString() : 'N/A'}`);
  }

  // 15 minutes before
  try {
    await scheduleEpisodeNotification('reminder_15min', episode, new Date(airTime - 15 * MINUTE));
  } catch (e) {
    console.error('Failed to schedule 15min reminder', e,
      `Expected schedule time: ${new Date(airTime - 15 * MINUTE).toISOString()}`,
      `Episode air time: ${new Date(airTime).toISOString()}`,
      `Previous episode air time: ${previousEpisodeAirDate ? new Date(previousEpisodeAirDate.getTime()).toISOString() : 'N/A'}`);
  }

  // Episode starting (at air time)
  try {
    await scheduleEpisodeNotification('episode_starting', episode, new Date(airTime));
  } catch (e) {
    console.error('Failed to schedule episode starting notification', e,
      `Expected schedule time: ${new Date(airTime).toISOString()}`,
      `Episode air time: ${new Date(airTime).toISOString()}`,
      `Previous episode air time: ${previousEpisodeAirDate ? new Date(previousEpisodeAirDate.getTime()).toISOString() : 'N/A'}`);
  }

  // Episode finished (air time + runtime)
  try {
    await scheduleEpisodeNotification('episode_finished', episode, new Date(airTime + episode.runtime * MINUTE));
  } catch (e) {
    console.error('Failed to schedule episode finished notification', e,
      `Expected schedule time: ${new Date(airTime + episode.runtime * MINUTE).toISOString()}`,
      `Episode air time: ${new Date(airTime).toISOString()}`,
      `Previous episode air time: ${previousEpisodeAirDate ? new Date(previousEpisodeAirDate.getTime()).toISOString() : 'N/A'}`);
  }
}
