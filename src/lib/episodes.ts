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
