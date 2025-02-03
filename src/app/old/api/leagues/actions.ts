'use server';
import { db } from '~/server/db';
import { eq, and, not, exists } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { leagueMembers } from '~/server/db/schema/members';
import { leagues, leagueSettings } from '~/server/db/schema/leagues';

export async function updateDisplayName(leagueId: number, newName?: string) {
  const user = await auth();
  if (!user.userId) throw new Error('User not authenticated');

  if (!newName) throw new Error('Display name is required');
  if (newName.length > 16)
    throw new Error('Display name must be 16 characters or less');
  if (newName.length < 1)
    throw new Error('Display name must be at least 1 character');

  try {
    await db
      .update(leagueMembers)
      .set({ displayName: newName })
      .where(
        and(
          eq(leagueMembers.userId, user.userId),
          eq(leagueMembers.league, leagueId),
        ),
      );
  } catch (e) {
    throw new Error('Display name already in use');
  }
}

export async function updateColor(leagueId: number, newColor?: string) {
  const user = await auth();
  if (!user.userId) throw new Error('User not authenticated');

  if (!newColor) throw new Error('Color is required');
  if (newColor.length !== 7) throw new Error('Color must be 7 characters long');
  if (!newColor.startsWith('#') || !newColor.slice(1).match(/^[0-9A-Fa-f]+$/))
    throw new Error('Color must be valid hex code');

  await db
    .update(leagueMembers)
    .set({ color: newColor })
    .where(
      and(
        eq(leagueMembers.userId, user.userId),
        eq(leagueMembers.league, leagueId),
      ),
    );
}

export async function leaveLeague(leagueId: number) {
  const user = await auth();
  if (!user.userId) throw new Error('User not authenticated');

  const member = await db
    .delete(leagueMembers)
    .where(
      and(
        eq(leagueMembers.userId, user.userId),
        not(eq(leagueMembers.isOwner, true)),
        eq(leagueMembers.league, leagueId),
      ),
    )
    .returning({ name: leagueMembers.displayName, id: leagueMembers.id });

  if (member.length === 0) throw new Error('User cannot leave league as owner');

  // remove user from draft order
  const draftOrder = (await db
    .select({ draftOrder: leagueSettings.draftOrder })
    .from(leagueSettings)
    .where(eq(leagueSettings.league, leagueId))
    .then((res) => res[0]?.draftOrder ?? [])).filter(id => id !== member[0]!.id);
  await db
    .update(leagueSettings)
    .set({ draftOrder })
    .where(eq(leagueSettings.league, leagueId));
}

export async function deleteLeague(leagueId: number) {
  const user = await auth();
  if (!user.userId) throw new Error('User not authenticated');

  await db.delete(leagues).where(
    and(
      eq(leagues.id, leagueId),
      exists(
        db
          .select()
          .from(leagueMembers)
          .where(
            and(
              eq(leagueMembers.league, leagueId),
              eq(leagueMembers.userId, user.userId),
              eq(leagueMembers.isOwner, true),
            ),
          ),
      ),
    ),
  );
}

async function makeAdmin(leagueId: number, displayName: string) {
  await db
    .update(leagueMembers)
    .set({ isAdmin: true })
    .where(
      and(
        eq(leagueMembers.league, leagueId),
        eq(leagueMembers.displayName, displayName),
      ),
    );
}

async function removeAdmin(leagueId: number, displayName: string) {
  await db
    .update(leagueMembers)
    .set({ isAdmin: false })
    .where(
      and(
        eq(leagueMembers.league, leagueId),
        eq(leagueMembers.displayName, displayName),
      ),
    );
}

async function transferOwner(
  leagueId: number,
  displayName: string,
  userId: string,
) {
  const checkOwner = await db
    .select({ isOwner: leagueMembers.isOwner })
    .from(leagueMembers)
    .where(
      and(
        eq(leagueMembers.league, leagueId),
        eq(leagueMembers.userId, userId),
        eq(leagueMembers.isOwner, true),
      ),
    )
    .then((res) => res[0]?.isOwner ?? false);

  if (!checkOwner) throw new Error('User is not owner of league');

  await Promise.all([
    db
      .update(leagueMembers)
      .set({ isOwner: true })
      .where(
        and(
          eq(leagueMembers.league, leagueId),
          eq(leagueMembers.displayName, displayName),
        ),
      ),
    db
      .update(leagueMembers)
      .set({ isOwner: false, isAdmin: true })
      .where(
        and(
          eq(leagueMembers.league, leagueId),
          eq(leagueMembers.userId, userId),
        ),
      ),
  ]);
}

async function bootMember(
  leagueId: number,
  displayName: string,
  userId: string,
) {
  const checkOwner = await db
    .select({ isOwner: leagueMembers.isOwner })
    .from(leagueMembers)
    .where(
      and(
        eq(leagueMembers.league, leagueId),
        eq(leagueMembers.userId, userId),
        eq(leagueMembers.isOwner, true),
      ),
    )
    .then((res) => res[0]?.isOwner ?? false);

  if (!checkOwner) throw new Error('User is not owner of league');

  await db
    .delete(leagueMembers)
    .where(
      and(
        eq(leagueMembers.league, leagueId),
        eq(leagueMembers.displayName, displayName),
      ),
    );
}

export async function promoteMember(leagueId: number, displayName: string) {
  const user = await auth();
  if (!user.userId) throw new Error('User not authenticated');

  const userStatus = await db
    .select({ isAdmin: leagueMembers.isAdmin, isOwner: leagueMembers.isOwner })
    .from(leagueMembers)
    .where(
      and(
        eq(leagueMembers.league, leagueId),
        eq(leagueMembers.displayName, displayName),
      ),
    );

  if (!userStatus[0]) throw new Error('User not found in league');
  if (userStatus[0].isOwner) throw new Error('Cannot promote owner');
  if (userStatus[0].isAdmin)
    await transferOwner(leagueId, displayName, user.userId);
  else await makeAdmin(leagueId, displayName);
}

export async function demoteMember(leagueId: number, displayName: string) {
  const user = await auth();
  if (!user.userId) throw new Error('User not authenticated');

  const userStatus = await db
    .select({ isAdmin: leagueMembers.isAdmin, isOwner: leagueMembers.isOwner })
    .from(leagueMembers)
    .where(
      and(
        eq(leagueMembers.league, leagueId),
        eq(leagueMembers.displayName, displayName),
      ),
    );

  if (!userStatus[0]) throw new Error('User not found in league');
  if (userStatus[0].isOwner) throw new Error('Cannot demote owner');
  if (userStatus[0].isAdmin) await removeAdmin(leagueId, displayName);
  else await bootMember(leagueId, displayName, user.userId);
}
