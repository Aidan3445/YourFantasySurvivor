import 'server-only';
import { db } from '~/server/db';
import { count, eq } from 'drizzle-orm';
import { baseEventRules, leagues, settings } from '~/server/db/schema/leagues';
import { auth } from '@clerk/nextjs/server';
import { leagueMembers } from '~/server/db/schema/members';
import { seasons } from '~/server/db/schema/seasons';
import { castaways } from '~/server/db/schema/castaways';
import { adminEventRules } from '~/server/db/schema/adminEvents';
import { weeklyEventRules } from '~/server/db/schema/weeklyEvents';
import { predictionRules } from '~/server/db/schema/predictions';

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

export async function getSettings(leagueId: number) {
  // get events and draft settings
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  const baseEvents = db
    .select({
      advantages: {
        found: baseEventRules.advFound,
        play: baseEventRules.advPlay,
        badPlay: baseEventRules.badAdvPlay,
        elim: baseEventRules.advElim,
      },
      challenges: {
        tribe1st: baseEventRules.tribe1st,
        tribe2nd: baseEventRules.tribe2nd,
        indivWin: baseEventRules.indivWin,
        indivReward: baseEventRules.indivReward,
      },
      other: {
        spokeEpTitle: baseEventRules.spokeEpTitle,
        finalists: baseEventRules.finalists,
        fireWin: baseEventRules.fireWin,
        soleSurvivor: baseEventRules.soleSurvivor,
      },
    })
    .from(baseEventRules)
    .where(eq(baseEventRules.league, leagueId));

  const adminEvents = db
    .select({
      name: adminEventRules.name,
      description: adminEventRules.description,
      points: adminEventRules.points,
      referenceType: adminEventRules.referenceType,
    })
    .from(adminEventRules)
    .where(eq(adminEventRules.league, leagueId));

  const weeklyEvents = db
    .select({
      name: weeklyEventRules.name,
      adminEvent: weeklyEventRules.adminEvent,
      baseEvent: weeklyEventRules.baseEvent,
      description: weeklyEventRules.description,
      points: weeklyEventRules.points,
      type: weeklyEventRules.type,
      referenceType: weeklyEventRules.referenceType,
      selectionCount: weeklyEventRules.selectionCount,
    })
    .from(weeklyEventRules)
    .where(eq(weeklyEventRules.league, leagueId));

  const predictionEvents = db
    .select({
      name: predictionRules.name,
      adminEvent: predictionRules.adminEvent,
      baseEvent: predictionRules.baseEvent,
      description: predictionRules.description,
      points: predictionRules.points,
      referenceType: predictionRules.referenceType,
      selectionCount: predictionRules.selectionCount,
    })
    .from(predictionRules)
    .where(eq(predictionRules.league, leagueId));

  const draft = db
    .select({
      inviteOnly: settings.inviteOnly,
      uniquePicks: settings.uniquePicks,
      pickCount: settings.pickCount,
      date: settings.date,
      order: settings.order,
      turnLimitMins: settings.turnLimitMins,
    })
    .from(settings)
    .where(eq(settings.league, leagueId));

  const [base, admin, weekly, season, draftSettings] = await Promise.all([baseEvents, adminEvents, weeklyEvents, predictionEvents, draft]);

  return { base: base[0], admin, weekly, season, draft: draftSettings[0] };
}

