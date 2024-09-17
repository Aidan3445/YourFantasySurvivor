'use server';
import { db } from '~/server/db';
import { leagueMembers } from '~/server/db/schema/members';
import { and, eq, count, sql } from 'drizzle-orm';
import { twentyColors } from '~/lib/colors';
import { leagues, leagueSettings } from '~/server/db/schema/leagues';
import { auth } from '@clerk/nextjs/server';
import { castaways } from '~/server/db/schema/castaways';

export async function joinLeague(name: string, password: string, displayName: string): Promise<number> {
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  const league = await db
    .select({ id: leagues.id, inviteOnly: leagueSettings.inviteOnly, season: leagues.season })
    .from(leagues)
    .leftJoin(leagueSettings, eq(leagues.id, leagueSettings.league))
    .where(and(eq(leagues.name, name), eq(leagues.password, password)))
    .then((leagues) => leagues[0]);

  if (!league || league.inviteOnly) throw new Error('Invalid league name or password');

  const memberCounter = db
    .select({ count: count() })
    .from(leagueMembers)
    .where(eq(leagueMembers.league, league.id))
    .then(res => res[0]?.count ?? 0);
  const castawayCounter = db
    .select({ count: count() })
    .from(castaways)
    .where(eq(castaways.season, league.season))
    .then(res => res[0]?.count ?? 0);
  const [memberCount, castawayCount] = await Promise.all([memberCounter, castawayCounter]);

  if (memberCount >= castawayCount) throw new Error('League is full');

  await insertMember(league.id, user.userId, displayName);

  return league.id;
}

export async function insertMember(leagueId: number, userId: string, displayName: string, isOwner = false, isAdmin = false): Promise<void> {
  const color = await chooseColor(leagueId);

  if (!displayName) throw new Error('Display name is required');
  displayName = displayName.slice(0, 16);

  // insert member
  const memberId = await db
    .insert(leagueMembers)
    .values({
      league: leagueId,
      userId: userId,
      color: color,
      displayName: displayName,
      isOwner: isOwner,
      isAdmin: isAdmin,
    })
    .returning({ id: leagueMembers.id })
    .then((res) => res[0]?.id);

  try {
    // check if member was inserted successfully
    if (!memberId) throw new Error('Failed joining league');

    // add member to draft order
    await db
      .update(leagueSettings)
      .set({ draftOrder: sql`array_append(${leagueSettings.draftOrder}, ${memberId})` })
      .where(eq(leagueSettings.league, leagueId));
  } catch (e) {
    // rollback member insert
    await db
      .delete(leagueMembers)
      .where(and(
        eq(leagueMembers.league, leagueId),
        eq(leagueMembers.userId, userId)));

    throw e;
  }
}

async function chooseColor(leagueId: number) {
  const colors = await db.select({ color: leagueMembers.color })
    .from(leagueMembers)
    .where(eq(leagueMembers.league, leagueId))
    .then((res) => res.map((r) => r.color));

  const available = twentyColors.filter((c) => !colors.includes(c));

  return available[Math.floor(Math.random() * available.length)]!;
}
