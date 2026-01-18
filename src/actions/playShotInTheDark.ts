'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import useShotInTheDarkMutation from '~/services/leagues/mutation/useShotInTheDark';

/**
  * Activate shot in the dark for the upcoming episode
  * @param hash The hash of the league
  * @throws an error if the shot in the dark cannot be activated
  * @returns Success status of the activation
  * @returnObj `{ success }`
  */
export default async function playShotInTheDark(hash: string) {
  try {
    return await requireLeagueMemberAuth(useShotInTheDarkMutation)(hash);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to activate shot in the dark', e);
    throw new Error(message);
  }
}
