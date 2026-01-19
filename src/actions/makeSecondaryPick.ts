'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import makeSecondaryPickLogic from '~/services/leagues/mutation/makeSecondaryPick';

/**
  * Choose a secondary pick castaway
  * @param hash The hash of the league
  * @param castawayId The id of the castaway
  * @throws an error if the castaway cannot be chosen
  * @throws an error if the user is not in the league
  * @returns an object indicating success
  * @returnObj `{ success }`
  */
export default async function chooseSecondary(
  hash: string,
  castawayId: number,
) {
  try {
    return await requireLeagueMemberAuth(makeSecondaryPickLogic)(hash, castawayId);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to choose secondary pick castaway', e);
    throw new Error('An error occurred while choosing the secondary pick castaway.');
  }
}
