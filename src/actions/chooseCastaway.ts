'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import chooseCastawayLogic from '~/services/leagues/mutation/chooseCastaway';

/**
  * Choose a castaway, either in the draft or as a selection update
  * @param hash The hash of the league
  * @param castawayId The id of the castaway
  * @param isDraft Whether the castaway is being chosen in the draft
  * @throws an error if the castaway cannot be chosen
  * @throws an error if the user is not in the league
  * @returns an object indicating success and if the draft is complete
  * @returnObj `{ success, draftComplete? }`
  */
export default async function chooseCastaway(
  hash: string,
  castawayId: number,
) {
  try {
    return await requireLeagueMemberAuth(chooseCastawayLogic)(hash, castawayId);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to choose castaway', e);
    throw new Error('An error occurred while choosing the castaway.');
  }
}
