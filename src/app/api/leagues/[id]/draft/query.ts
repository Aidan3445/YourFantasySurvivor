import 'server-only';
import { getLeagueSettings } from '~/app/api/leagues/[id]/settings/query';
import { getRules } from '~/app/api/leagues/[id]/rules/query';
import { getCastaways, getRemainingCastaways } from '~/app/api/seasons/[name]/castaways/query';
import { getLeague } from '~/app/api/leagues/query';
import { getTribes } from '~/app/api/seasons/[name]/tribes/query';
import { auth } from '@clerk/nextjs/server';
import { seasonCastaways, type SeasonEventRuleType, seasonEvents, seasonMembers, seasonTribes } from '~/server/db/schema/seasonEvents';
import { db } from '~/server/db';
import { castaways } from '~/server/db/schema/castaways';
import { leagueMembers, selectionUpdates } from '~/server/db/schema/members';
import { aliasedTable, and, asc, eq } from 'drizzle-orm';
import { tribes } from '~/server/db/schema/tribes';

export async function getDraftDetails(leagueId: number) {
  const { userId } = auth();
  if (!userId) throw new Error('User not authenticated');

  const [league, settings, { season }] = await Promise.all([
    getLeague(leagueId),
    getLeagueSettings(leagueId),
    getRules(leagueId),
  ]);

  const predictions = season
    .filter((rule) => rule.timing === 'premiere')
    .reduce((preds, rule) => {
      if (!preds[rule.referenceType]) preds[rule.referenceType] = [];
      preds[rule.referenceType]!.push(rule);
      return preds;
    }, {} as {
      castaway?: SeasonEventRuleType[];
      tribe?: SeasonEventRuleType[];
      member?: SeasonEventRuleType[];
    });

  const [castaways, tribes] = await Promise.all([
    getCastaways(league.league.season),
    getTribes(league.league.season),
  ]);

  const nextTurn = settings.draftOrder.find((member) => !member.drafted);

  const [yourTurn, remaining] = await Promise.all([(nextTurn ?
    db.selectDistinct({ yourTurn: leagueMembers.id })
      .from(leagueMembers)
      .where(and(
        eq(leagueMembers.league, leagueId),
        eq(leagueMembers.userId, userId),
        eq(leagueMembers.displayName, nextTurn.name)))
      .limit(1)
      .then((res) => res.length > 0) : false),
  getRemainingCastaways(league.league.season)
  ]);

  const unavailable = castaways
    .filter((c) => remaining.some((r) => r.name === c.name))
    .filter((c) => settings.draftOrder
      .some((d) => d.drafted.slice(-1)[0] === c.more.shortName));

  return {
    league,
    settings,
    predictions,
    castaways,
    tribes,
    yourTurn,
    unavailable,
    remaining: castaways.filter((c) => remaining.some((r) => r.name === c.name)),
  };
}

export async function getCurrentPredictions(
  leagueId: number,
  castaway?: SeasonEventRuleType[],
  tribe?: SeasonEventRuleType[],
  member?: SeasonEventRuleType[]) {
  const { userId } = auth();
  if (!userId) throw new Error('User not authenticated');

  const [firstPick, castawayPicks, tribePicks, memberPicks] = await Promise.all([
    db.select({ name: castaways.name })
      .from(leagueMembers)
      .innerJoin(selectionUpdates, and(
        eq(selectionUpdates.member, leagueMembers.id),
        eq(leagueMembers.league, leagueId)))
      .innerJoin(castaways, eq(selectionUpdates.castaway, castaways.id))
      .where(eq(leagueMembers.userId, userId))
      .orderBy(asc(selectionUpdates.episode))
      .then((res) => res[0]?.name),

    Promise.all(castaway ? castaway.map((rule) => db
      .select({ castaway: castaways.name })
      .from(seasonEvents)
      .innerJoin(users, and(
        eq(seasonEvents.member, users.id),
        eq(users.userId, userId)))
      .innerJoin(seasonCastaways, eq(seasonCastaways.event, seasonEvents.id))
      .innerJoin(castaways, eq(seasonCastaways.castaway, castaways.id))
      .where(eq(seasonEvents.rule, rule.id!))
      .then((res) => res[0]?.castaway)) : []),

    Promise.all(tribe ? tribe.map((rule) => db
      .select({ tribe: tribes.name })
      .from(seasonEvents)
      .innerJoin(users, and(
        eq(seasonEvents.member, users.id),
        eq(users.userId, userId)))
      .innerJoin(seasonTribes, eq(seasonTribes.event, seasonEvents.id))
      .innerJoin(tribes, eq(seasonTribes.tribe, tribes.id))
      .where(eq(seasonEvents.rule, rule.id!))
      .then((res) => res[0]?.tribe)) : []),

    Promise.all(member ? member.map((rule) => db
      .select({ member: leagueMembers.displayName })
      .from(seasonEvents)
      .innerJoin(users, and(
        eq(seasonEvents.member, users.id),
        eq(users.userId, userId)))
      .innerJoin(seasonMembers, eq(seasonMembers.event, seasonEvents.id))
      .innerJoin(leagueMembers, eq(seasonMembers.member, leagueMembers.id))
      .where(eq(seasonEvents.rule, rule.id!))
      .then((res) => res[0]?.member)) : [])
  ]);

  return { firstPick, castawayPicks, tribePicks, memberPicks };
}

export type Predictions = Awaited<ReturnType<typeof getCurrentPredictions>>;

// used to differntiate between the logged in user/owner of the event
// and the member chosen in a prediction
const users = aliasedTable(leagueMembers, 'user');
