'use server';

import { db } from '~/server/db';
import { leagueChatSchema } from '~/server/db/schema/leagueChat';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
  * Save a chat message to the database
  * @param auth The authenticated league member
  * @param message The message object with serial, text, and timestamp
  * @throws an error if the message cannot be saved
  * @returns Success status of the save
  * @returnObj `{ success }`
  */
export default async function saveChatMessageLogic(
  auth: VerifiedLeagueMemberAuth,
  message: { serial: string, text: string, timestamp: string }
) {
  // Insert the message into the database
  const entry = await db
    .insert(leagueChatSchema)
    .values({
      leagueId: auth.leagueId,
      sentById: auth.memberId,
      ...message,
    })
    .returning({ serial: leagueChatSchema.serial })
    .then((res) => res[0]?.serial);

  if (!entry) throw new Error('Failed to save chat message');

  return { success: true };
}
