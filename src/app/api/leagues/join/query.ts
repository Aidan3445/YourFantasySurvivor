import 'server-only';
import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import { leagues } from '~/server/db/schema/leagues';
import { auth } from '@clerk/nextjs/server';
import { insertMember } from './insert';

export async function joinLeague(name: string, password: string, displayName: string): Promise<number> {
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  const leagueId = await db
    .select({ id: leagues.id })
    .from(leagues)
    .where(and(eq(leagues.name, name), eq(leagues.password, password)))
    .then((leagues) => leagues[0]);


  if (!leagueId) throw new Error('Invalid league name or password');

  await insertMember(leagueId.id, user.userId, displayName);

  return leagueId.id;
}

