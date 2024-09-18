'server-only';
import { auth } from '@clerk/nextjs/server';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '~/server/db';
import { castaways } from '~/server/db/schema/castaways';
import { leagues, leagueSettings } from '~/server/db/schema/leagues';
import { leagueMembers, selectionUpdates } from '~/server/db/schema/members';
import { seasons } from '~/server/db/schema/seasons';

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
    .map((memberId: number) => getDraftedSurvivor(leagueId, memberId))))
    .filter((member) => member.name && member.color) as {
      name: string,
      color: string,
      drafted: string | null
    }[];
  if (draftOrder.length !== settings.draftOrder.length) throw new Error('Draft order not found');

  return { ...settings, draftOrder, draftDate: new Date(settings.draftDate), draftOver };
}

export async function getDraftedSurvivor(leagueId: number, memberId: number) {
  return db
    .select({
      name: leagueMembers.displayName,
      color: leagueMembers.color,
      drafted: castaways.shortName
    })
    .from(leagueMembers)
    .leftJoin(selectionUpdates, and(
      eq(selectionUpdates.member, leagueMembers.id),
      isNull(selectionUpdates.episode)))
    .leftJoin(castaways, eq(selectionUpdates.castaway, castaways.id))
    .where(and(
      eq(leagueMembers.league, leagueId),
      eq(leagueMembers.id, memberId)))
    .then((res) => ({ name: res[0]?.name, color: res[0]?.color, drafted: res[0]?.drafted }));
}
