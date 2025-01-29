import 'server-only';
import { leagueAdminAuth } from '../[id]/score/actions';
import { db } from '~/server/db';
import { leagues } from '~/server/db/schema/leagues';
import { eq } from 'drizzle-orm';

export async function renameLeague(leagueId: number, newName: string): Promise<void> {
  const { userId } = await leagueAdminAuth(leagueId);
  if (!userId) throw new Error('Not authorized');

  const renamedLeague = await db
    .update(leagues)
    .set({ name: newName })
    .where(eq(leagues.id, leagueId));

  if (!renamedLeague) throw new Error('Failed to rename league');

  return;
}

export async function changeLeaguePassword(leagueId: number, newPassword: string): Promise<void> {
  const { userId } = await leagueAdminAuth(leagueId);
  if (!userId) throw new Error('Not authorized');

  const changedPassword = await db
    .update(leagues)
    .set({ password: newPassword })
    .where(eq(leagues.id, leagueId));

  if (!changedPassword) throw new Error('Failed to change league password');

  return;
}
