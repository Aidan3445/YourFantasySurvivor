import 'server-only';
import { db } from '~/server/db';
import { count, eq } from 'drizzle-orm';
import { leagues } from '~/server/db/schema/leagues';
//const auth = () => ({ userId: '_1' }); 
import { auth } from '@clerk/nextjs/server';
import { leagueMembers } from '~/server/db/schema/members';
import { seasons } from '~/server/db/schema/seasons';
import { castaways } from '~/server/db/schema/castaways';


export async function getLeague(leagueId: number) {
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  const leagueFetch = db
    .select({
      id: leagues.id,
      name: leagues.name,
      season: seasons.name,
      password: leagues.password,
    })
    .from(leagues)
    .where(eq(leagues.id, leagueId))
    .innerJoin(seasons, eq(seasons.id, leagues.season));
  const membersFetch = db
    .select({
      displayName: leagueMembers.displayName,
      color: leagueMembers.color,
      isAdmin: leagueMembers.isAdmin,
      isOwner: leagueMembers.isOwner,
      userId: leagueMembers.userId,
    })
    .from(leagueMembers)
    .where(eq(leagueMembers.league, leagueId));

  const [league, members] = await Promise.all([leagueFetch, membersFetch]);

  if (league.length === 0) throw new Error('League not found');
  if (!members.find((member) => member.userId === user.userId)) throw new Error('The signed in user is not a member of this league');
  const safeMembers = members.map((member) => {
    const safeMember: Member = {
      displayName: member.displayName,
      color: member.color,
      isAdmin: member.isAdmin,
      isOwner: member.isOwner,
      loggedIn: member.userId === user.userId,
    };
    return safeMember;
  });

  const isFull = await db
    .select({ count: count() })
    .from(castaways)
    .innerJoin(seasons, eq(castaways.season, seasons.id))
    .where(eq(seasons.name, league[0]!.season))
    .then((count) => count[0]!.count <= safeMembers.length);

  return { league: league[0]!, members: safeMembers, isFull };
}

export async function getLeagues() {
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  const userLeagues = await db
    .select({ name: leagues.name, season: seasons.name, id: leagues.id })
    .from(leagueMembers)
    .where(eq(leagueMembers.userId, user.userId))
    .innerJoin(leagues, eq(leagueMembers.league, leagues.id))
    .innerJoin(seasons, eq(leagues.season, seasons.id));
  return userLeagues;
}

export interface Member {
  displayName: string;
  color: string;
  isAdmin: boolean;
  isOwner: boolean;
  loggedIn: boolean;
}
