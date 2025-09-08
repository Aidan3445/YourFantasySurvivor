import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { type Hash } from '~/types/deprecated/leagues';
import { leagueChatSchema } from '~/server/db/schema/leagueChat';

type Message = typeof leagueChatSchema.$inferSelect

/**
    * Get chat history for a league
    * @param hash - the hash of the league
    * @return the chat history for the league
    * @throws an error if the user is not a member of the league
    */
export default async function getChatHistory(hash: Hash) {
  const messageData = await db
    .select()
    .from(leagueChatSchema)
    .where(eq(leagueChatSchema.hash, hash));

  const messages: Message[] = messageData.map((message) => ({
    ...message,
    headers: {
      'sent-by-id': message.sentById,
    },
    clientId: hash,
    timestamp: new Date(`${message.timestamp} Z`),
  } as unknown as Message));

  return messages;
}
