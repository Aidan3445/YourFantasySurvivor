'use server';

import { requireSystemAdminAuth } from '~/lib/auth';
import { createSeasonLogic } from '~/services/seasons/mutation/createSeason';

/**
  * Create a new season
  * @param seasonName The season to create the tribe in
  * @param premiereDate The premiere date of the season
  */
export default async function createSeason(
  seasonName: string,
  premiereDate: Date,
  finaldeData?: Date
) {
  try {
    return await requireSystemAdminAuth(createSeasonLogic)(seasonName, new Date(premiereDate).toUTCString(), finaldeData ? new Date(finaldeData).toUTCString() : undefined);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not authenticated')) throw e;

    console.error('Failed to create season', e);
    throw new Error('An error occurred while creating the season.');
  }
}

