'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import { type LeagueSettingsUpdate, type SecondaryPickSettings } from '~/types/leagues';
import updateLeagueSettingsLogic from '~/services/leagues/mutation/updateLeagueSettings';

/**
  * Update secondary pick settings
  * @param hash The hash of the league
  * @param settings The secondary pick settings
  * @throws an error if the settings cannot be updated
  * @throws an error if the user is not in the league
  * @returns an object indicating success
  * @returnObj `{ success }`
  */
export default async function updateSecondaryPickSettings(
  hash: string,
  settings: SecondaryPickSettings,
) {
  try {
    const settingsUpdate: Partial<LeagueSettingsUpdate> = {
      secondaryPickEnabled: settings.enabled,
      secondaryPickCanPickOwn: settings.canPickOwnSurvivor,
      secondaryPickLockoutPeriod: settings.lockoutPeriod,
      secondaryPickPublicPicks: settings.publicPicks,
      secondaryPickMultiplier: settings.multiplier,
    };


    return await requireLeagueMemberAuth(updateLeagueSettingsLogic)(hash, settingsUpdate);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to update secondary pick settings', e);
    throw new Error('An error occurred while updating the secondary pick settings.');
  }
}
