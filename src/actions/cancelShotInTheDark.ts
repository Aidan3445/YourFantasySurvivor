'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import cancelShotInTheDarkLogic from '~/services/leagues/mutation/cancelShotInTheDark';

/**
  * Cancel shot in the dark activation
  * @param hash The hash of the league
  * @throws an error if the shot in the dark cannot be cancelled
  * @returns Success status of the cancellation
  * @returnObj `{ success }`
  */
export default async function cancelShotInTheDark(hash: string) {
  try {
    return await requireLeagueMemberAuth(cancelShotInTheDarkLogic)(hash);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to cancel shot in the dark', e);
    throw new Error(message);
  }
}
