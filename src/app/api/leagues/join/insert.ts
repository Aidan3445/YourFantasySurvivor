import 'server-only';
import { db } from '~/server/db';
import { leagueMembers } from '~/server/db/schema/members';
import { eq } from 'drizzle-orm';
import { twentyColors } from '~/lib/colors';

export async function insertMember(leagueId: number, userId: string, displayName: string, isOwner = false, isAdmin = false): Promise<void> {
  const color = await chooseColor(leagueId);

  await db
    .insert(leagueMembers)
    .values({
      league: leagueId,
      userId: userId,
      color: color,
      displayName: displayName,
      isOwner: isOwner,
      isAdmin: isAdmin,
    });
}

async function chooseColor(leagueId: number) {
  const colors = await db.select({ color: leagueMembers.color })
    .from(leagueMembers)
    .where(eq(leagueMembers.league, leagueId))
    .then((res) => res.map((r) => r.color));

  const available = twentyColors.filter((c) => !colors.includes(c));

  return available[Math.floor(Math.random() * available.length)]!;
}
