import 'server-only';
import { db } from '~/server/db';
import { aliasedTable, eq } from 'drizzle-orm';
import { baseEventRules, leagues } from '~/server/db/schema/leagues';
import { auth } from '@clerk/nextjs/server';
import { customEventRules } from '~/server/db/schema/customEvents';
import { weeklyEventRules } from '~/server/db/schema/weeklyEvents';
import { seasonCastawayResults, seasonCastaways, seasonEventRules, seasonEvents, seasonMemberResults, seasonMembers, seasonTribeResults, seasonTribes } from '~/server/db/schema/seasonEvents';
import { leagueMembers } from '~/server/db/schema/members';
import { castaways } from '~/server/db/schema/castaways';
import { tribes } from '~/server/db/schema/tribes';
import { seasons } from '~/server/db/schema/seasons';
import { getCastaway } from '~/app/api/seasons/[name]/castaways/[castaway]/query';
import { getTribes } from '~/app/api/seasons/[name]/tribes/query';

export async function getRules(leagueId: number) {
  // get event rules
  const user = await auth();
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
      id: customEventRules.id,
      name: customEventRules.name,
      description: customEventRules.description,
      points: customEventRules.points,
      referenceType: customEventRules.referenceType,
    })
    .from(customEventRules)
    .where(eq(customEventRules.league, leagueId));

  const weeklyEvents = db
    .select({
      id: weeklyEventRules.id,
      name: weeklyEventRules.name,
      //adminEvent: weeklyEventRules.adminEvent,
      //baseEvent: weeklyEventRules.baseEvent,
      description: weeklyEventRules.description,
      points: weeklyEventRules.points,
      type: weeklyEventRules.type,
      timing: weeklyEventRules.timing,
      referenceType: weeklyEventRules.referenceType,
    })
    .from(weeklyEventRules)
    .where(eq(weeklyEventRules.league, leagueId));

  const seasonEvents = db
    .select({
      id: seasonEventRules.id,
      name: seasonEventRules.name,
      //adminEvent: seasonRules.adminEvent,
      //baseEvent: seasonRules.baseEvent,
      description: seasonEventRules.description,
      points: seasonEventRules.points,
      referenceType: seasonEventRules.referenceType,
      timing: seasonEventRules.timing,
    })
    .from(seasonEventRules)
    .where(eq(seasonEventRules.league, leagueId));

  const [base, custom, weekly, season] = await Promise.all([baseEvents, customEvents, weeklyEvents, seasonEvents]);

  // base spread is technically not safe but is handled by the form
  return { ...base[0]!, custom, weekly, season };
}

const members = aliasedTable(leagueMembers, 'member');
const resultCastaways = aliasedTable(castaways, 'resultCastaway');
const resultTribes = aliasedTable(tribes, 'resultTribe');
const resultMembers = aliasedTable(leagueMembers, 'resultMember');

export async function getSeasonPredictions(leagueId: number) {
  const predictions = await db
    .select({
      id: seasonEventRules.id,
      name: seasonEventRules.name,
      description: seasonEventRules.description,
      points: seasonEventRules.points,
      referenceType: seasonEventRules.referenceType,
      timing: seasonEventRules.timing,
      pick: {
        castaway: castaways.name,
        tribe: tribes.name,
        member: leagueMembers.displayName,
        color: leagueMembers.color
      },
      member: members.displayName,
      premiere: seasons.premierDate,
      season: seasons.name,
      result: {
        castaway: resultCastaways.name,
        tribe: resultTribes.name,
        member: resultMembers.displayName,
        color: resultMembers.color
      }
    })
    .from(seasonEventRules)
    .innerJoin(leagues, eq(seasonEventRules.league, leagues.id))
    .innerJoin(seasons, eq(leagues.season, seasons.id))
    .innerJoin(seasonEvents, eq(seasonEvents.rule, seasonEventRules.id))
    .leftJoin(members, eq(members.id, seasonEvents.member))
    .leftJoin(seasonCastaways, eq(seasonCastaways.event, seasonEvents.id))
    .leftJoin(castaways, eq(seasonCastaways.reference, castaways.id))
    .leftJoin(seasonTribes, eq(seasonTribes.event, seasonEvents.id))
    .leftJoin(tribes, eq(seasonTribes.reference, tribes.id))
    .leftJoin(seasonMembers, eq(seasonMembers.event, seasonEvents.id))
    .leftJoin(leagueMembers, eq(seasonMembers.reference, leagueMembers.id))
    .leftJoin(seasonCastawayResults, eq(seasonCastawayResults.rule, seasonEventRules.id))
    .leftJoin(resultCastaways, eq(seasonCastawayResults.result, resultCastaways.id))
    .leftJoin(seasonTribeResults, eq(seasonTribeResults.rule, seasonEventRules.id))
    .leftJoin(resultTribes, eq(seasonTribeResults.result, resultTribes.id))
    .leftJoin(seasonMemberResults, eq(seasonMemberResults.rule, seasonEventRules.id))
    .leftJoin(resultMembers, eq(seasonMemberResults.result, resultMembers.id))
    .where(eq(seasonEventRules.league, leagueId))
    .then((res) => res
      .some((prediction) =>
        new Date(`${prediction.premiere} -4:00`) < new Date()) ? res : []);

  // get color for each prediction
  return await Promise.all(predictions.map(async (p) => {
    if (p.pick.castaway) p.pick.color = await getCastaway(p.season, p.pick.castaway)
      .then((c) => c.details.startingTribe.color);
    else if (p.pick.tribe) p.pick.color = (await getTribes(p.season))
      .find((t) => t.name === p.pick.tribe)!.color;

    if (Object.values(p.result).some((r) => r)) {
      if (p.result.castaway) p.result.color = await getCastaway(p.season, p.result.castaway)
        .then((c) => c.details.startingTribe.color);
      else if (p.result.tribe) p.result.color = (await getTribes(p.season))
        .find((t) => t.name === p.result.tribe)!.color;
    } else if (!p.result.member) {
      p.result.member = 'TBD';
      p.result.color = '#aaaaaa';
    }

    return p;
  }));
}
