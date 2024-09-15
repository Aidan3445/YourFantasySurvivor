'server-only';
import { auth } from '@clerk/nextjs/server';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '~/server/db';
import { castaways } from '~/server/db/schema/castaways';
import { leagueSettings } from '~/server/db/schema/leagues';
import { leagueMembers, selectionUpdates } from '~/server/db/schema/members';

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

  const draftOrder = (await Promise.all(settings.draftOrder.map((id: string) => db
    .select({
      name: leagueMembers.displayName,
      color: leagueMembers.color,
      drafted: castaways.name
    })
    .from(leagueMembers)
    .leftJoin(selectionUpdates, and(
      eq(selectionUpdates.member, leagueMembers.id),
      isNull(selectionUpdates.episode)))
    .leftJoin(castaways, eq(selectionUpdates.castaway, castaways.id))
    .where(and(
      eq(leagueMembers.league, leagueId),
      eq(leagueMembers.userId, id)))
    .then((res) => ({ name: res[0]?.name, color: res[0]?.color, drafted: res[0]?.drafted })))))
    .filter((member) => member.name && member.color) as {
      name: string,
      color: string,
      drafted: string | null
    }[];

  if (draftOrder.length !== settings.draftOrder.length) throw new Error('Draft order not found');

  return { ...settings, draftOrder, draftDate: new Date(settings.draftDate) };
}
