import 'server-only';
import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagues } from '~/server/db/schema/leagues';
import { auth } from '@clerk/nextjs/server';
import { leagueMembers } from '~/server/db/schema/members';
import { seasons } from '~/server/db/schema/seasons';

export async function getLeague(leagueId: number) {
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  const leagueFetch = db
    .select({
      name: leagues.name,
      season: seasons.name,
      locked: leagues.locked,
      unique: leagues.uniquePicks,
      picks: leagues.pickCount
    })
    .from(leagues)
    .where(eq(leagues.id, leagueId))
    .rightJoin(seasons, eq(seasons.id, leagues.season));
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
  if (!members.find((member) => member.userId === user.userId)) throw new Error('User not a member of this league');
  const safeMembers = members.map((member) => {
    const safeMember: {
      displayName: string;
      color: string;
      isAdmin: boolean;
      isOwner: boolean;
      userId?: string;
    } = { ...member };
    delete safeMember.userId;
    return safeMember;
  });

  return { league: league[0], members: safeMembers };
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
