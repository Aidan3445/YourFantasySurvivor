'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import updateLeagueSettingsLogic from '~/services/leagues/mutation/updateLeagueSettings';
import { type LeagueSettingsUpdate } from '~/types/leagues';

/**
  * Update the league settings
  * @param leagueHash The hash of the league
  * @param update The settings to update
  * @throws an error if the draft timing cannot be updated
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function updateLeagueSettings(
  leagueHash: string,
  update: LeagueSettingsUpdate
) {
  try {
    return await requireLeagueMemberAuth(updateLeagueSettingsLogic)(leagueHash, update);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to update league settings', e);
    throw new Error('An error occurred while updating the league settings.');
  }
}
