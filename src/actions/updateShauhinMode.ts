'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import updateShauhinModeLogic from '~/services/leagues/mutation/updateShauhinMode';
import { type ShauhinModeSettings } from '~/types/leagues';

/**
  * Update the Shauhin Mode settings for a league
  * @param hash The hash of the league
  * @param shauhinMode The new Shauhin Mode settings
  * @throws an error if the Shauhin Mode settings cannot be updated
  * @throws an error if the league is inactive
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function updateShauhinMode(
  hash: string,
  shauhinMode: ShauhinModeSettings,
) {
  try {
    return await requireLeagueMemberAuth(updateShauhinModeLogic)(hash, shauhinMode);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to update Shauhin Mode settings', e);
    throw new Error('An error occurred while updating the Shauhin Mode settings.');
  }
}
