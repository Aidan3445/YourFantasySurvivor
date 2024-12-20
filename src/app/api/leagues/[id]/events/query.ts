import 'server-only';
import { db } from '~/server/db';
import { aliasedTable, and, asc, desc, eq } from 'drizzle-orm';
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
import { episodes } from '~/server/db/schema/episodes';
import { EventResult } from '../score/query';

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

const resultCastaways = aliasedTable(castaways, 'resultCastaway');
const resultTribes = aliasedTable(tribes, 'resultTribe');
const resultMembers = aliasedTable(leagueMembers, 'resultMember');
const pickMembers = aliasedTable(leagueMembers, 'pickMember');


export async function getSeasonPredictions(leagueId: number) {
  await db.select({
    episode: episodes.number,
    points: seasonEventRules.points,
    eventName: seasonEventRules.name,
    description: seasonEventRules.description,
    referenceType: seasonEventRules.referenceType,
    timing: seasonEventRules.timing,
    name: leagueMembers.displayName,
    pick: {
      name: castaways.name,
      color: leagueMembers.color,
    },
    result: {
      name: resultCastaways.name,
      color: leagueMembers.color,
    },

    season: seasons.name,
  })
    .from(seasonEvents)
    .innerJoin(leagueMembers, eq(leagueMembers.id, seasonEvents.member))
    .innerJoin(seasonEventRules, eq(seasonEventRules.id, seasonEvents.rule))
    .innerJoin(leagues, eq(leagues.id, seasonEventRules.league))
    .innerJoin(seasons, eq(seasons.id, leagues.season))
    .innerJoin(seasonCastaways, eq(seasonCastaways.event, seasonEvents.id))
    .innerJoin(castaways, eq(castaways.id, seasonCastaways.reference))
    .leftJoin(seasonCastawayResults, eq(seasonCastawayResults.rule, seasonEventRules.id))
    .leftJoin(episodes, eq(episodes.id, seasonCastawayResults.episode))
    .leftJoin(resultCastaways, eq(resultCastaways.id, seasonCastawayResults.result))
    .where(and(
      eq(leagues.id, leagueId),
      eq(seasonEventRules.referenceType, 'castaway')));


  const predictions = await Promise.all([
    db.select({
      name: leagueMembers.displayName,
      episode: episodes.number,
      points: seasonEventRules.points,
      eventName: seasonEventRules.name,
      description: seasonEventRules.description,
      referenceType: seasonEventRules.referenceType,
      timing: seasonEventRules.timing,
      pick: castaways.name,
      result: resultCastaways.name,

      season: seasons.name,
      pickColor: leagueMembers.color,
      resultColor: leagueMembers.color,
    })
      .from(seasonEvents)
      .innerJoin(leagueMembers, eq(leagueMembers.id, seasonEvents.member))
      .innerJoin(seasonEventRules, eq(seasonEventRules.id, seasonEvents.rule))
      .innerJoin(leagues, eq(leagues.id, seasonEventRules.league))
      .innerJoin(seasons, eq(seasons.id, leagues.season))
      .innerJoin(seasonCastaways, eq(seasonCastaways.event, seasonEvents.id))
      .innerJoin(castaways, eq(castaways.id, seasonCastaways.reference))
      .leftJoin(seasonCastawayResults, eq(seasonCastawayResults.rule, seasonEventRules.id))
      .leftJoin(episodes, eq(episodes.id, seasonCastawayResults.episode))
      .leftJoin(resultCastaways, eq(resultCastaways.id, seasonCastawayResults.result))
      .where(and(
        eq(leagues.id, leagueId),
        eq(seasonEventRules.referenceType, 'castaway')))
      .orderBy(desc(seasonEventRules.timing)),
    db.select({
      name: leagueMembers.displayName,
      episode: episodes.number,
      points: seasonEventRules.points,
      eventName: seasonEventRules.name,
      description: seasonEventRules.description,
      referenceType: seasonEventRules.referenceType,
      timing: seasonEventRules.timing,
      pick: tribes.name,
      result: resultTribes.name,

      season: seasons.name,
      pickColor: leagueMembers.color,
      resultColor: leagueMembers.color,
    })
      .from(seasonEvents)
      .innerJoin(leagueMembers, eq(leagueMembers.id, seasonEvents.member))
      .innerJoin(seasonEventRules, eq(seasonEventRules.id, seasonEvents.rule))
      .innerJoin(leagues, eq(leagues.id, seasonEventRules.league))
      .innerJoin(seasons, eq(seasons.id, leagues.season))
      .innerJoin(seasonTribes, eq(seasonTribes.event, seasonEvents.id))
      .innerJoin(tribes, eq(tribes.id, seasonTribes.reference))
      .leftJoin(seasonTribeResults, eq(seasonTribeResults.rule, seasonEventRules.id))
      .leftJoin(episodes, eq(episodes.id, seasonTribeResults.episode))
      .leftJoin(resultTribes, eq(resultTribes.id, seasonTribeResults.result))
      .where(and(
        eq(leagues.id, leagueId),
        eq(seasonEventRules.referenceType, 'tribe')))
      .orderBy(desc(seasonEventRules.timing)),
    db.select({
      name: leagueMembers.displayName,
      episode: episodes.number,
      points: seasonEventRules.points,
      eventName: seasonEventRules.name,
      description: seasonEventRules.description,
      referenceType: seasonEventRules.referenceType,
      timing: seasonEventRules.timing,
      pick: pickMembers.displayName,
      result: resultMembers.displayName,

      season: seasons.name,
      pickColor: pickMembers.color,
      resultColor: resultMembers.color,
    })
      .from(seasonEvents)
      .innerJoin(leagueMembers, eq(leagueMembers.id, seasonEvents.member))
      .innerJoin(seasonEventRules, eq(seasonEventRules.id, seasonEvents.rule))
      .innerJoin(leagues, eq(leagues.id, seasonEventRules.league))
      .innerJoin(seasons, eq(seasons.id, leagues.season))
      .innerJoin(seasonMembers, eq(seasonMembers.event, seasonEvents.id))
      .innerJoin(pickMembers, eq(pickMembers.id, seasonMembers.reference))
      .leftJoin(seasonMemberResults, eq(seasonMemberResults.rule, seasonEventRules.id))
      .leftJoin(episodes, eq(episodes.id, seasonMemberResults.episode))
      .leftJoin(resultMembers, eq(resultMembers.id, seasonMemberResults.result))
      .where(and(
        eq(leagues.id, leagueId),
        eq(seasonEventRules.referenceType, 'member')))
      .orderBy(desc(seasonEventRules.timing))
  ]);

  console.log(predictions[0].filter((p) => p.name === 'Aidan'));

  /*/ get color for each prediction
  return await Promise.all([
    ...predictions[0].map(async (p) => {
      const castaway = await getCastaway

      await Promise.all(predictions.map(async (p) => {
        if (p.) p.pick.color = await getCastaway(p.season, p.pick.castaway)
          .then((c) => c.details.startingTribe.color);
        else if (p.pick.tribe) p.pick.color = (await getTribes(p.season))
          .find((t) => t.name === p.pick.tribe)!.color;
    
        if (Object.values(p.result).some((r) => r)) {
          if (p.result.castaway) {
            p.result.color = await getCastaway(p.season, p.result.castaway).then((c) => c.details.startingTribe.color);
            p.result.episode = p.result.episodeC;
          } else if (p.result.tribe) {
            p.result.color = (await getTribes(p.season)).find((t) => t.name === p.result.tribe)!.color;
            p.result.episode = p.result.episodeT;
          }
        } else if (!p.result.member) {
          p.result.member = 'TBD';
          p.result.color = '#aaaaaa';
          p.result.episode = null;
        }
    
        return p;
      }));*/
}
