import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { baseEventRules, defaultBaseRules, leagues, type LeagueInsert } from '~/server/db/schema/leagues';
import { insertMember } from '../join/actions';
import { newLeagueSettings } from '../[id]/settings/insert';
import { eq } from 'drizzle-orm';

export async function insertLeague(league: LeagueInsert, displayName: string): Promise<number> {
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  const leagueId = await db
    .insert(leagues)
    .values(league)
    .returning({ id: leagues.id })
    .then((result) => result[0]);

  if (!leagueId) throw new Error('Unknown error occurred');

  try {
    // set default base rules
    await db.insert(baseEventRules).values({ league: leagueId.id, ...defaultBaseRules() });
    // set default settings
    await newLeagueSettings(leagueId.id);
    // add the creator as league owner
    await insertMember(leagueId.id, user.userId, displayName, true, true);
  } catch (e) {
    // rollback 
    // because of cascade rules, deleting the league will 
    // also delete any subsequent inserts before the error
    await db.delete(leagues).where(eq(leagues.id, leagueId.id));
    throw e;
  }

  return leagueId.id;
}
