import 'server-only';
import { db } from '~/server/db';
import { and, count, eq } from 'drizzle-orm';
import { leagues, leagueSettings } from '~/server/db/schema/leagues';
import { auth } from '@clerk/nextjs/server';
import { insertMember } from './insert';
import { leagueMembers } from '~/server/db/schema/members';
import { castaways } from '~/server/db/schema/castaways';

export async function joinLeague(name: string, password: string, displayName: string): Promise<number> {
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  const league = await db
    .select({ id: leagues.id, inviteOnly: leagueSettings.inviteOnly, season: leagues.season })
    .from(leagues)
    .leftJoin(leagueSettings, eq(leagues.id, leagueSettings.league))
    .where(and(eq(leagues.name, name), eq(leagues.password, password)))
    .then((leagues) => leagues[0]);

  if (!league || league.inviteOnly) throw new Error('Invalid league name or password');

  const memberCounter = db
    .select({ count: count() })
    .from(leagueMembers)
    .where(eq(leagueMembers.league, league.id))
    .then(res => res[0]?.count ?? 0);
  const castawayCounter = db
    .select({ count: count() })
    .from(castaways)
    .where(eq(castaways.season, league.season))
    .then(res => res[0]?.count ?? 0);
  const [memberCount, castawayCount] = await Promise.all([memberCounter, castawayCounter]);

  if (memberCount >= castawayCount) throw new Error('League is full');

  await insertMember(league.id, user.userId, displayName);

  return league.id;
}

