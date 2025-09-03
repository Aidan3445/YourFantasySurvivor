'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import chooseCastawayLogic from '~/services/leagues/mutation/chooseCastaway';

/**
 * Choose a castaway, either in the draft or as a selection update
 * @param leagueHash The hash of the league
 * @param castawayId The id of the castaway
 * @param isDraft Whether the castaway is being chosen in the draft
 * @throws an error if the user is not authorized
 * @throws an error if the castaway cannot be chosen
 */
export default async function chooseCastaway(
  leagueHash: string,
  castawayId: number,
  isDraft: boolean
) {
  try {
    return await requireLeagueMemberAuth(chooseCastawayLogic)(leagueHash, castawayId, isDraft);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to choose castaway', e);
    throw new Error('An error occurred while choosing the castaway. Please try again.');
  }
}
