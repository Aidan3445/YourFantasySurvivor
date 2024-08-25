import 'server-only';
import { db } from '~/server/db';
import { count, eq } from 'drizzle-orm';
import { baseEventRules, leagues } from '~/server/db/schema/leagues';
import { auth } from '@clerk/nextjs/server';
import { leagueMembers } from '~/server/db/schema/members';
import { seasons } from '~/server/db/schema/seasons';
import { castaways } from '~/server/db/schema/castaways';
import { customEventRules } from '~/server/db/schema/customEvents';
import { weeklyEventRules } from '~/server/db/schema/weeklyEvents';
import { seasonRules } from '~/server/db/schema/seasonEvents';
import { type RulesType } from '~/server/db/schema/rules';

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

export async function getRules(leagueId: number):
  Promise<RulesType> {
  // get event rules
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  const baseEvents = db
    .select({
      advFound: baseEventRules.advFound,
      advPlay: baseEventRules.advPlay,
      badAdvPlay: baseEventRules.badAdvPlay,
      advElim: baseEventRules.advElim,
      tribe1st: baseEventRules.tribe1st,
      tribe2nd: baseEventRules.tribe2nd,
      indivWin: baseEventRules.indivWin,
      indivReward: baseEventRules.indivReward,
      spokeEpTitle: baseEventRules.spokeEpTitle,
      finalists: baseEventRules.finalists,
      fireWin: baseEventRules.fireWin,
      soleSurvivor: baseEventRules.soleSurvivor,
    })
    .from(baseEventRules)
    .where(eq(baseEventRules.league, leagueId));

  const customEvents = db
    .select({
      name: customEventRules.name,
      description: customEventRules.description,
      points: customEventRules.points,
      referenceType: customEventRules.referenceType,
    })
    .from(customEventRules)
    .where(eq(customEventRules.league, leagueId));

  const weeklyEvents = db
    .select({
      name: weeklyEventRules.name,
      //adminEvent: weeklyEventRules.adminEvent,
      //baseEvent: weeklyEventRules.baseEvent,
      description: weeklyEventRules.description,
      points: weeklyEventRules.points,
      type: weeklyEventRules.type,
      referenceType: weeklyEventRules.referenceType,
    })
    .from(weeklyEventRules)
    .where(eq(weeklyEventRules.league, leagueId));

  const seasonEvents = db
    .select({
      name: seasonRules.name,
      adminEvent: seasonRules.adminEvent,
      baseEvent: seasonRules.baseEvent,
      description: seasonRules.description,
      points: seasonRules.points,
      referenceType: seasonRules.referenceType,
    })
    .from(seasonRules)
    .where(eq(seasonRules.league, leagueId));

  const [base, custom, weekly, season] = await Promise.all([baseEvents, customEvents, weeklyEvents, seasonEvents]);

  // base spread is technically not safe but is handled by the form
  return { ...base[0]!, custom, weekly, season };
}

