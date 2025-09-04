'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import saveChatMessageLogic from '~/services/leagues/mutation/saveChatMessage';
import { type LeagueHash } from '~/types/deprecated/leagues';

/**
 * Save a chat message to the database
 * @param auth The authenticated league member
 * @param message The message object with serial, text, and timestamp
 * @throws an error if the message cannot be saved
 * @returns Success status of the save
 * @returnObj `{ success }`
 */
export default async function saveChatMessage(
  leagueHash: LeagueHash,
  message: { serial: string, text: string, timestamp: string }
) {
  try {
    return await requireLeagueMemberAuth(saveChatMessageLogic)(leagueHash, message);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to save chat message', e);
    throw new Error('An error occurred while saving the chat message. Please try again.');
  }
}
