import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { and, asc, eq, or } from 'drizzle-orm';
import { db } from '~/server/db';
import { castaways } from '~/server/db/schema/castaways';
import { leagues, leagueSettings } from '~/server/db/schema/leagues';
import { leagueMembers, selectionUpdates } from '~/server/db/schema/members';
import { seasons } from '~/server/db/schema/seasons';
import { episodes } from '~/server/db/schema/episodes';

export async function getLeagueSettings(leagueId: number) {
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  const settings = await db
    .select({
      pickCount: leagueSettings.pickCount,
      draftDate: leagueSettings.draftDate,
      draftOrder: leagueSettings.draftOrder,
      turnLimitMins: leagueSettings.turnLimitMins
    })
    .from(leagueSettings)
    .where(eq(leagueSettings.league, leagueId))
    .then((res) => res[0]);

  if (!settings) throw new Error('League settings not found');

  const draftOver = await db.select({ premiere: seasons.premierDate })
    .from(seasons)
    .innerJoin(leagues, eq(leagues.season, seasons.id))
    .innerJoin(leagueSettings, eq(leagueSettings.league, leagues.id))
    .where(eq(leagueSettings.league, leagueId))
    .then((res) => res[0]?.premiere)
    .then((premiere) => {
      if (!premiere) throw new Error('Season premiere date not found');
      return new Date(premiere) < new Date();
    });

  const draftOrder = (await Promise.all(settings.draftOrder
    .map((memberId: number) => Promise.all([
      getMember(memberId), getSurvivorsList(leagueId, memberId)
    ]))))
    .map(([member, drafted]) => ({ ...member, drafted }))
    .filter((draft): draft is { name: string, color: string, drafted: string[] } => !!draft);

  if (draftOrder.length !== settings.draftOrder.length) throw new Error('Draft order not found');

  return { ...settings, draftOrder, draftDate: new Date(settings.draftDate), draftOver };
}

async function getMember(memberId: number) {
  return db
    .select({ name: leagueMembers.displayName, color: leagueMembers.color })
    .from(leagueMembers)
    .where(eq(leagueMembers.id, memberId))
    .then((res) => res[0]);
}

export async function getSurvivorsList(leagueId: number, memberId: number) {
  return db
    .select({ name: castaways.shortName })
    .from(leagueMembers)
    .innerJoin(selectionUpdates, eq(selectionUpdates.member, leagueMembers.id))
    .innerJoin(episodes, eq(selectionUpdates.episode, episodes.id))
    .innerJoin(castaways, eq(selectionUpdates.castaway, castaways.id))
    .where(and(
      eq(leagueMembers.league, leagueId),
      eq(leagueMembers.id, memberId)))
    .orderBy(asc(episodes.number))
    .then((res) => res.map((castaway) => castaway.name));
}

export async function isOwner(leagueId: number, userId: string) {
  return db
    .select({ isOwner: leagueMembers.isOwner })
    .from(leagueMembers).where(and(
      eq(leagueMembers.league, leagueId),
      eq(leagueMembers.userId, userId),
      or(eq(leagueMembers.isAdmin, true), eq(leagueMembers.isOwner, true))))
    .then((members) => {
      if (members.length === 0) throw new Error('Not authorized');
      return members[0]!.isOwner;
    });
}
