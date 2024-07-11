import 'server-only';
import { db } from '~/server/db';
import { leagueMembers } from '~/server/db/schema/members';

export async function insertMember(leagueId: number, userId: string, displayName: string, isOwner = false, isAdmin = false): Promise<void> {
  await db
    .insert(leagueMembers)
    .values({
      league: leagueId,
      userId: userId,
      color: getRandomColor(),
      displayName: displayName,
      isOwner: isOwner,
      isAdmin: isAdmin,
    })
    .onConflictDoNothing({
      target: [leagueMembers.league, leagueMembers.userId],
    });
}

function getRandomColor() {
  // Generate a random integer between 0 and 0xFFFFFF
  const randomColorInt = Math.floor(Math.random() * 0xFFFFFF);

  // Convert the integer to a hex string and pad with zeros if necessary
  const randomColorHex = `#${randomColorInt.toString(16).padStart(6, '0')}`;

  return randomColorHex;
}
