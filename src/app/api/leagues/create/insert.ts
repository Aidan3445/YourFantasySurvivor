'server-only';
import { auth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { baseEventRules, defaultBaseRules, leagues, type LeagueInsert } from '~/server/db/schema/leagues';
import { insertMember } from '../join/insert';

export async function insertLeague(league: LeagueInsert, displayName: string): Promise<number> {
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  const leagueId = await db
    .insert(leagues)
    .values(league)
    .returning({ id: leagues.id })
    .then((result) => result[0]);

  if (!leagueId) throw new Error('Unknown error occurred');

  // add the creator as league owner
  await insertMember(leagueId.id, user.userId, displayName, true, true);
  // set default base rules
  await db
    .insert(baseEventRules)
    .values({ league: leagueId.id, ...defaultBaseRules() });

  return leagueId.id;
}
