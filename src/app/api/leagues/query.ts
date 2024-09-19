import 'server-only';
import { db } from '~/server/db';
import { count, eq } from 'drizzle-orm';
import { leagues, leagueSettings } from '~/server/db/schema/leagues';
//const auth = () => ({ userId: '_1' }); 
import { auth } from '@clerk/nextjs/server';
import { leagueMembers, type Member } from '~/server/db/schema/members';
import { seasons } from '~/server/db/schema/seasons';
import { castaways } from '~/server/db/schema/castaways';
import { getSurvivorsList } from './[id]/settings/query';


export async function getLeague(leagueId: number) {
  const { userId } = auth();
  if (!userId) throw new Error('User not authenticated');

  const leagueFetch = db
    .select({
      id: leagues.id,
      name: leagues.name,
      season: seasons.name,
      password: leagues.password,
      draftDate: leagueSettings.draftDate,
    })
    .from(leagues)
    .where(eq(leagues.id, leagueId))
    .innerJoin(seasons, eq(seasons.id, leagues.season))
    .innerJoin(leagueSettings, eq(leagueSettings.league, leagues.id));
  const membersFetch = db
    .select()
    .from(leagueMembers)
    .where(eq(leagueMembers.league, leagueId));

  const [league, members] = await Promise.all([leagueFetch, membersFetch]);

  if (league.length === 0) throw new Error('League not found');
  if (!members.find((member) => member.userId === userId)) throw new Error('The signed in user is not a member of this league');
  const safeMembers = await Promise.all(members.map(async (member) => {
    const safeMember = {
      id: member.id,
      displayName: member.displayName,
      color: member.color,
      isAdmin: member.isAdmin,
      isOwner: member.isOwner,
      loggedIn: member.userId === userId,
    };
    return {
      ...safeMember,
      drafted: (await getSurvivorsList(leagueId, member.id))
    } as Member;
  }));


  const isFull = new Date(league[0]!.draftDate) < new Date() ||
    await db
      .select({ count: count() })
      .from(castaways)
      .innerJoin(seasons, eq(castaways.season, seasons.id))
      .where(eq(seasons.name, league[0]!.season))
      .then((count) => count[0]!.count <= safeMembers.length);

  return { league: league[0]!, members: safeMembers, isFull };
}

export async function getLeagues() {
  const { userId } = auth();
  if (!userId) throw new Error('User not authenticated');

  const userLeagues = await db
    .select({ name: leagues.name, season: seasons.name, id: leagues.id })
    .from(leagueMembers)
    .where(eq(leagueMembers.userId, userId))
    .innerJoin(leagues, eq(leagueMembers.league, leagues.id))
    .innerJoin(seasons, eq(leagues.season, seasons.id));
  return userLeagues;
}

