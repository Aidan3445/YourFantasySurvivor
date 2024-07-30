'use server';
import { db } from '~/server/db';
import { eq, and, exists } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { leagueMembers } from '~/server/db/schema/members';
import { leagues } from '~/server/db/schema/leagues';

export async function updateDisplayName(leagueId: number, newName?: string) {
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  if (!newName) throw new Error('Display name is required');
  if (newName.length > 16) throw new Error('Display name must be 16 characters or less');
  if (newName.length < 1) throw new Error('Display name must be at least 1 character');

  await db.update(leagueMembers)
    .set({ displayName: newName })
    .where(and(
      eq(leagueMembers.userId, user.userId),
      eq(leagueMembers.league, leagueId)));
}

export async function updateColor(leagueId: number, newColor?: string) {
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  if (!newColor) throw new Error('Color is required');
  if (newColor.length !== 7) throw new Error('Color must be 7 characters long');
  if (!newColor.startsWith('#') || !newColor.slice(1).match(/^[0-9A-Fa-f]+$/)) throw new Error('Color must be valid hex code');

  await db.update(leagueMembers)
    .set({ color: newColor })
    .where(and(
      eq(leagueMembers.userId, user.userId),
      eq(leagueMembers.league, leagueId)));
}

export async function leaveLeague(leagueId: number) {
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  await db.delete(leagueMembers)
    .where(and(
      eq(leagueMembers.userId, user.userId),
      eq(leagueMembers.league, leagueId)));
}

export async function deleteLeague(leagueId: number) {
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  await db.delete(leagues)
    .where(and(
      eq(leagues.id, leagueId),
      exists(db.select().from(leagueMembers)
        .where(and(
          eq(leagueMembers.league, leagueId),
          eq(leagueMembers.userId, user.userId),
          eq(leagueMembers.isOwner, true)
        ))
      )));
}
