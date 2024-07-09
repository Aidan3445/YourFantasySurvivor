'server-only';
import { auth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { leagues, type LeagueInsert } from '~/server/db/schema/leagues';
import { insertMember } from '../join/insert';

export async function insertLeague(league: LeagueInsert, displayName: string): Promise<number> {
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');
  league.owner = user.userId;

  const leagueId = await db
    .insert(leagues)
    .values(league)
    .returning({ id: leagues.id })
    .then((result) => result[0]);

  if (!leagueId) throw new Error('Error creating league');

  await insertMember(leagueId.id, user.userId, displayName, true, true);

  return leagueId.id;
}
