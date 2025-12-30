import 'server-only';

import { revalidateTag } from 'next/cache';

/**
  * Reset serverside cache by revalidating all relevant tags
  * @returns success status
  * @returnObj { success }
  */
export async function resetServersideCache() {
  try {
    const tagsToRevalidate = [
      'seasons',
      'all-seasons',
      'base-events',
      'castaways',
      'current-seasons',
      'eliminations',
      'episodes',
      'events',
      'tribes',
      'tribe-members',
    ];

    for (const tag of tagsToRevalidate) {
      revalidateTag(tag, 'max');
    }

    return { success: true };
  } catch (error) {
    console.error('Error resetting serverside cache', error);
    return { success: false };
  }
}
