import { type KeyEpisodes } from '~/types/episodes';
import { type PredictionTiming } from '~/types/events';
import { type LeagueStatus } from '~/types/leagues';

export const DEFAULT_EPISODE_RUNTIME = 90;

export const AirStatuses = ['Aired', 'Upcoming', 'Airing'] as const;

export type AirStatus = (typeof AirStatuses)[number];

/**
 * Calculate the current air status of an episode based on air date and runtime
 * @param airDate The episode's air date
 * @param runtime The episode's runtime in minutes
 * @returns The current air status
 */
export function getAirStatus(airDate: Date, runtime: number): AirStatus {
  const now = new Date();
  const endTime = new Date(airDate.getTime() + runtime * 60 * 1000);

  if (now < airDate) {
    return 'Upcoming';
  } else if (now < endTime) {
    return 'Airing';
  } else {
    return 'Aired';
  }
}

/**
 * Calculate key episodes (previous, next, merge) from an episodes array
 * This function is used by both frontend (dev tools) and backend to ensure consistency
 * @param episodes Array of episodes to process
 * @returns KeyEpisodes object with previous, next, and merge episodes
 */
export function calculateKeyEpisodes<T extends { airStatus: AirStatus; isMerge: boolean }>(episodes: T[]): { previousEpisode: T | null; nextEpisode: T | null; mergeEpisode: T | null } {
  return episodes.reduce((acc, episode) => {
    if (episode.airStatus === 'Aired' || episode.airStatus === 'Airing') {
      acc.previousEpisode = episode;
    }
    if (episode.airStatus === 'Upcoming' && !acc.nextEpisode) {
      acc.nextEpisode = episode;
    }
    if (episode.isMerge) {
      acc.mergeEpisode = episode;
    }
    return acc;
  }, {
    previousEpisode: null,
    nextEpisode: null,
    mergeEpisode: null,
  } as { previousEpisode: T | null; nextEpisode: T | null; mergeEpisode: T | null });
}

/**
 * Calculate the optimal polling interval based on when the next air status change will occur.
 * Returns the time in milliseconds until we should check again.
 * Formula: poll at 1/2 the time remaining until next status change, with a minimum of 15 seconds.
 * @param episodes Array of episodes to check
 * @returns Polling interval in milliseconds, or null if no upcoming changes
 */
export function getAirStatusPollingInterval(episodes: { airDate: Date; runtime: number }[] | undefined): number | null {
  if (!episodes || episodes.length === 0) return null;

  const now = new Date();
  const MIN_INTERVAL = 15 * 1000; // 15 seconds minimum
  const MAX_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours maximum

  // Find the next status change time
  let nextChangeTime: number | null = null;

  for (const episode of episodes) {
    const airDate = episode.airDate;
    const endTime = new Date(airDate.getTime() + episode.runtime * 60 * 1000);

    // Check if episode will start airing in the future
    if (now < airDate) {
      const timeUntilStart = airDate.getTime() - now.getTime();
      if (nextChangeTime === null || timeUntilStart < nextChangeTime) {
        nextChangeTime = timeUntilStart;
      }
    }

    // Check if episode is currently airing and will end in the future
    if (now >= airDate && now < endTime) {
      const timeUntilEnd = endTime.getTime() - now.getTime();
      if (nextChangeTime === null || timeUntilEnd < nextChangeTime) {
        nextChangeTime = timeUntilEnd;
      }
    }
  }

  if (nextChangeTime === null) {
    // No upcoming status changes
    return null;
  }

  // Poll at half the time remaining, with min/max constraints
  const interval = Math.max(MIN_INTERVAL, Math.min(nextChangeTime / 2, MAX_INTERVAL));

  return Math.floor(interval);
}


/**
  * Get the active prediction timings for a league based on key episodes and league status
  * @param keyEpisodes The key episodes for the league's season
  * @param leagueStatus The current status of the league
  * @param startWeek The league's start week
  * @returns Array of active prediction timings
  */
export function getActiveTimings({
  keyEpisodes,
  leagueStatus,
  startWeek,
}: {
  keyEpisodes: KeyEpisodes
  leagueStatus: LeagueStatus,
  startWeek: number | null,
}) {
  const { previousEpisode, nextEpisode, mergeEpisode } = keyEpisodes;

  const timings: PredictionTiming[] = ['Weekly'];
  // Draft takes precedence if included in the list: 
  // - if the league is in draft status
  // - if there are no previous episodes
  // - if the draft date is after the last aired episode
  if (leagueStatus === 'Draft' || !previousEpisode || startWeek === nextEpisode?.episodeNumber) {
    timings.push('Draft');
  }

  // Weekly premerge only if included in the list and no merge episode has aired yet
  if (!mergeEpisode || mergeEpisode.airStatus === 'Upcoming') {
    timings.push('Weekly (Premerge only)');
  }

  // Weekly postmerge only if included in the list and merge episode has aired
  if (mergeEpisode && mergeEpisode.airStatus !== 'Upcoming') {
    timings.push('Weekly (Postmerge only)');
  }

  // After merge only if included in the list and merge episode is last aired
  if (previousEpisode?.isMerge) {
    timings.push('After Merge');
  }

  // Before finale only if included in the list and next episode is the finale
  if (nextEpisode?.isFinale) {
    timings.push('Before Finale');
  }

  return timings;
}


