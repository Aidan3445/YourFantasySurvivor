import 'server-only';
import { db } from '~/server/db';
import { aliasedTable, and, desc, eq, isNotNull } from 'drizzle-orm';
import { baseEventRules, leagues, type Reference } from '~/server/db/schema/leagues';
import { auth } from '@clerk/nextjs/server';
import { customEventRules } from '~/server/db/schema/customEvents';
import { weeklyEventRules } from '~/server/db/schema/weeklyEvents';
import { seasonCastawayResults, seasonCastaways, seasonEventRules, seasonEvents, type SeasonEventTiming, seasonMemberResults, seasonMembers, seasonTribeResults, seasonTribes } from '~/server/db/schema/seasonEvents';
import { leagueMembers } from '~/server/db/schema/members';
import { castaways } from '~/server/db/schema/castaways';
import { tribes } from '~/server/db/schema/tribes';
import { seasons } from '~/server/db/schema/seasons';
import { getCastaway } from '~/app/api/seasons/[name]/castaways/[castaway]/query';
import { getTribes } from '~/app/api/seasons/[name]/tribes/query';
import { episodes } from '~/server/db/schema/episodes';
import { unionAll } from 'drizzle-orm/pg-core';

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
      eventName: customEventRules.eventName,
      description: customEventRules.description,
      points: customEventRules.points,
      referenceType: customEventRules.referenceType,
    })
    .from(customEventRules)
    .where(eq(customEventRules.league, leagueId));

  const weeklyEvents = db
    .select({
      id: weeklyEventRules.id,
      eventName: weeklyEventRules.eventName,
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
      eventName: seasonEventRules.eventName,
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

export type SeasonPrediction = {
  id: number
  eventName: string;
  points: number;
  description: string;
  referenceType: Reference;
  timing: SeasonEventTiming;
  member: string;
  pick: {
    name: string;
    color: string;
  };
  result: {
    name: string | null;
    color: string | null;
    episode: number | null;
  };
  season: string;
};

export async function getSeasonPredictions(leagueId: number, hitsOnly = false) {
  const castawayPredictions = db
    .select({
      id: seasonEventRules.id,
      eventName: seasonEventRules.eventName,
      points: seasonEventRules.points,
      description: seasonEventRules.description,
      referenceType: seasonEventRules.referenceType,
      timing: seasonEventRules.timing,
      member: leagueMembers.displayName,
      pick: {
        name: castaways.name,
        color: leagueMembers.color,
      },
      result: {
        name: resultCastaways.name,
        color: leagueMembers.color,
        episode: episodes.number,
      },
      season: seasons.seasonName,
    }).from(seasonEvents)
    .innerJoin(leagueMembers, eq(leagueMembers.id, seasonEvents.member))
    .innerJoin(seasonEventRules, eq(seasonEventRules.id, seasonEvents.rule))
    .innerJoin(leagues, eq(leagues.id, seasonEventRules.league))
    .innerJoin(seasons, eq(seasons.seasonId, leagues.season))
    .innerJoin(seasonCastaways, eq(seasonCastaways.event, seasonEvents.id))
    .innerJoin(castaways, eq(castaways.castawayId, seasonCastaways.reference))
    .leftJoin(seasonCastawayResults, eq(seasonCastawayResults.rule, seasonEventRules.id))
    .leftJoin(episodes, eq(episodes.episodeId, seasonCastawayResults.episode))
    .leftJoin(resultCastaways, eq(resultCastaways.castawayId, seasonCastawayResults.result))
    .where(and(
      eq(leagues.id, leagueId),
      eq(seasonEventRules.referenceType, 'castaway'),
      hitsOnly ? and(
        isNotNull(resultCastaways.name),
        eq(resultCastaways.name, castaways.name)) : undefined))
    .orderBy(desc(seasonEventRules.timing));

  const tribePredictions = db
    .select({
      id: seasonEventRules.id,
      eventName: seasonEventRules.eventName,
      points: seasonEventRules.points,
      description: seasonEventRules.description,
      referenceType: seasonEventRules.referenceType,
      timing: seasonEventRules.timing,
      member: leagueMembers.displayName,
      pick: {
        name: tribes.name,
        color: leagueMembers.color,
      },
      result: {
        name: resultTribes.name,
        color: leagueMembers.color,
        episode: episodes.number,
      },
      season: seasons.seasonName,
    })
    .from(seasonEvents)
    .innerJoin(leagueMembers, eq(leagueMembers.id, seasonEvents.member))
    .innerJoin(seasonEventRules, eq(seasonEventRules.id, seasonEvents.rule))
    .innerJoin(leagues, eq(leagues.id, seasonEventRules.league))
    .innerJoin(seasons, eq(seasons.seasonId, leagues.season))
    .innerJoin(seasonTribes, eq(seasonTribes.event, seasonEvents.id))
    .innerJoin(tribes, eq(tribes.tribeId, seasonTribes.reference))
    .leftJoin(seasonTribeResults, eq(seasonTribeResults.rule, seasonEventRules.id))
    .leftJoin(episodes, eq(episodes.episodeId, seasonTribeResults.episode))
    .leftJoin(resultTribes, eq(resultTribes.tribeId, seasonTribeResults.result))
    .where(and(
      eq(leagues.id, leagueId),
      eq(seasonEventRules.referenceType, 'tribe'),
      hitsOnly ? and(
        isNotNull(resultTribes.name),
        eq(resultTribes.name, tribes.name)) : undefined))
    .orderBy(desc(seasonEventRules.timing));

  const memberPredictions = db
    .select({
      id: seasonEventRules.id,
      eventName: seasonEventRules.eventName,
      points: seasonEventRules.points,
      description: seasonEventRules.description,
      referenceType: seasonEventRules.referenceType,
      timing: seasonEventRules.timing,
      member: leagueMembers.displayName,
      pick: {
        name: pickMembers.displayName,
        color: pickMembers.color,
      },
      result: {
        name: resultMembers.displayName,
        color: resultMembers.color,
        episode: episodes.number,
      },
      season: seasons.seasonName,
    })
    .from(seasonEvents)
    .innerJoin(leagueMembers, eq(leagueMembers.id, seasonEvents.member))
    .innerJoin(seasonEventRules, eq(seasonEventRules.id, seasonEvents.rule))
    .innerJoin(leagues, eq(leagues.id, seasonEventRules.league))
    .innerJoin(seasons, eq(seasons.seasonId, leagues.season))
    .innerJoin(seasonMembers, eq(seasonMembers.event, seasonEvents.id))
    .innerJoin(pickMembers, eq(pickMembers.id, seasonMembers.reference))
    .leftJoin(seasonMemberResults, eq(seasonMemberResults.rule, seasonEventRules.id))
    .leftJoin(episodes, eq(episodes.episodeId, seasonMemberResults.episode))
    .leftJoin(resultMembers, eq(resultMembers.id, seasonMemberResults.result))
    .where(and(
      eq(leagues.id, leagueId),
      eq(seasonEventRules.referenceType, 'member'),
      hitsOnly ? and(
        isNotNull(resultMembers.displayName),
        eq(resultMembers.displayName, pickMembers.displayName)) : undefined))
    .orderBy(desc(seasonEventRules.timing));

  const predictions: SeasonPrediction[] = await unionAll(castawayPredictions,
    unionAll(tribePredictions, memberPredictions as never) as never);

  return await Promise.all(predictions.map(async (pred) => {
    switch (pred.referenceType) {
      case 'castaway':
        [pred.pick.color, pred.result.color] = await Promise.all([
          getCastaway(pred.season, pred.pick.name).then((c) => c.details.startingTribe.color),
          pred.result.name ?
            getCastaway(pred.season, pred.result.name).then((c) => c.details.startingTribe.color) :
            '#aaaaaa'
        ]);
        break;
      case 'tribe':
        [pred.pick.color, pred.result.color] = [
          (await getTribes(pred.season)).find((t) => t.name === pred.pick.name)!.color,
          pred.result.name ?
            (await getTribes(pred.season)).find((t) => t.name === pred.result.name)!.color :
            '#aaaaaa'
        ];
        break;
      default:
        break;
    }
    return pred;
  }));
}
