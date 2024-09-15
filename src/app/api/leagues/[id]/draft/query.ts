import { getLeagueSettings } from '~/app/api/leagues/[id]/settings/query';
import { getRules } from '~/app/api/leagues/[id]/rules/query';
import { getCastaways } from '~/app/api/seasons/[name]/castaways/query';
import { getLeague } from '~/app/api/leagues/query';
import { getTribes } from '~/app/api/seasons/[name]/tribes/query';
import { auth } from '@clerk/nextjs/server';
import { seasonCastaways, type SeasonEventRuleType, seasonEvents } from '~/server/db/schema/seasonEvents';
import { db } from '~/server/db';
import { castaways } from '~/server/db/schema/castaways';
import { leagueMembers, selectionUpdates } from '~/server/db/schema/members';
import { and, eq, isNull } from 'drizzle-orm';

export async function getDraftDetails(leagueId: number) {
  const [league, settings, { season }] = await Promise.all([
    getLeague(leagueId),
    getLeagueSettings(leagueId),
    getRules(leagueId)
  ]);

  const [castaways, tribes] = await Promise.all([
    getCastaways(league.league.season),
    getTribes(league.league.season)
  ]);

  return { league, settings, seasonRules: season, castaways, tribes };
}

export async function getCurrentPredictions(
  leagueId: number,
  castaway?: SeasonEventRuleType[],
  _tribe?: SeasonEventRuleType[],
  _member?: SeasonEventRuleType[]) {
  const { userId } = auth();
  if (!userId) throw new Error('User not authenticated');

  const [firstPick, castawayPicks, tribePicks, memberPicks] = await Promise.all([
    db.select({ name: castaways.name })
      .from(leagueMembers)
      .innerJoin(selectionUpdates, and(
        eq(selectionUpdates.member, leagueMembers.id),
        eq(leagueMembers.league, leagueId)))
      .innerJoin(castaways, eq(selectionUpdates.castaway, castaways.id))
      .where(and(
        eq(leagueMembers.userId, userId),
        isNull(selectionUpdates.episode)))
      .then((res) => res[0]?.name ?? undefined),
    Promise.all(castaway ? castaway.map((rule) => db
      .select({ castaway: castaways.name })
      .from(seasonEvents)
      .innerJoin(leagueMembers, and(
        eq(seasonEvents.member, leagueMembers.id),
        eq(leagueMembers.userId, userId)))
      .innerJoin(seasonCastaways, eq(seasonCastaways.event, seasonEvents.id))
      .innerJoin(castaways, eq(seasonCastaways.castaway, castaways.id))
      .where(eq(seasonEvents.rule, rule.id))
      .then((res) => res[0]?.castaway ?? undefined)) : []),
    null,
    null,
  ]);

  return { firstPick, castawayPicks, tribePicks, memberPicks };
}

export type Predictions = Awaited<ReturnType<typeof getCurrentPredictions>>;
