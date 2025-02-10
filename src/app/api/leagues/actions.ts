'use server';
import { auth } from '@clerk/nextjs/server';
import { type DraftTiming } from '~/server/db/defs/leagues';
import { db } from '~/server/db';
import { baseEventRulesSchema } from '~/server/db/schema/baseEvents';
import { type BaseEventRuleType } from '~/server/db/defs/baseEvents';
import { leagueSettingsSchema, leaguesSchema } from '~/server/db/schema/leagues';
import { and, eq, inArray, not } from 'drizzle-orm';
import { leagueMemberAuth } from '~/lib/auth';
import { leagueMembersSchema } from '~/server/db/schema/leagueMembers';
import { type LeagueMember, type NewLeagueMember } from '~/server/db/defs/leagueMembers';
import { seasonsSchema } from '~/server/db/schema/seasons';
import { episodesSchema } from '~/server/db/schema/episodes';

/**
  * Create a new league
  * @param league - the league to create
  * @param settings - the settings for the league
  * @param rules - the base event rules for the league
  * @param newMember - the new member to add
  * @returns the id of the newly created league
  * @throws an error if the user is not authenticated
  * @throws an error if the league cannot be inserted
  * @throws an error if the league settings cannot be inserted
  * @throws an error if the base event rules cannot be inserted
  * @throws an error if the user cannot be added as a member
  */
export async function createNewLeague(
  leagueName: string,
  settings: { draftTiming: DraftTiming, survivalCap: number },
  rules: BaseEventRuleType,
  newMember: NewLeagueMember
): Promise<string> {
  const user = await auth();
  if (!user.userId) throw new Error('User not authenticated');

  // Get the season id
  // In future this will be a real fetch
  const seasonId = 11;

  // Create the league in a transaction
  return await db.transaction(async (trx) => {
    try {
      const insertedLeague = await trx
        .insert(leaguesSchema)
        .values({ leagueName, leagueSeason: seasonId })
        .returning({ leagueId: leaguesSchema.leagueId, leagueHash: leaguesSchema.leagueHash });

      // Safe to assume the league was inserted if we got this far
      // Get the league id and hash
      const { leagueId, leagueHash } = insertedLeague[0]!;

      // Insert the owner as a member
      const memberId = await trx
        .insert(leagueMembersSchema)
        .values({ leagueId, userId: user.userId, ...newMember })
        .returning({ memberId: leagueMembersSchema.memberId })
        .then((res) => res[0]?.memberId);
      if (!memberId) throw new Error('Failed to add user as a member');

      // Insert the league settings
      await trx
        .insert(leagueSettingsSchema)
        .values({ ...settings, leagueId, draftOrder: [memberId] });
      // Insert the base event rules
      await trx
        .insert(baseEventRulesSchema)
        .values({ ...rules, leagueId });

      return leagueHash;
    } catch (error) {
      console.error('Error creating league:', error);
      // Rollback the transaction
      trx.rollback();
      throw new Error('An error occurred while creating the league. Please try again.');
    }
  });
}

/** 
  * Join a league
  * @param leagueHash - the hash of the league
  * @param newMember - the new member to add
  * @param userId - the id of the user
  * @returns the id of the newly created member
  * @throws an error if the user is not authenticated
  * @throws an error if the league cannot be found
  * @throws an error if the user is already a member of the league
  * @throws an error if the user cannot be added as a member
  */
export async function joinLeague(leagueHash: string, newMember: NewLeagueMember): Promise<number> {
  const user = await auth();
  if (!user.userId) throw new Error('User not authenticated');

  const { leagueId, draftOrder } = await db
    .select({ leagueId: leaguesSchema.leagueId, draftOrder: leagueSettingsSchema.draftOrder })
    .from(leaguesSchema)
    .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId))
    .where(eq(leaguesSchema.leagueHash, leagueHash))
    .then((res) => ({ leagueId: res[0]?.leagueId, draftOrder: res[0]?.draftOrder }));
  if (!leagueId || !draftOrder) throw new Error('League not found');

  return await db.transaction(async (trx) => {
    // Try to add the member, if there is a conflict, the user is already a member
    const insertedMember = await db
      .insert(leagueMembersSchema)
      .values({ leagueId, userId: user.userId, ...newMember })
      .returning({ memberId: leagueMembersSchema.memberId })
      .then((res) => res[0]);
    if (!insertedMember) throw new Error('Failed to add user as a member');
    // Add the member to the draft order
    draftOrder.push(insertedMember.memberId);
    await trx
      .update(leagueSettingsSchema)
      .set({ draftOrder })
      .where(eq(leagueSettingsSchema.leagueId, leagueId));

    return insertedMember.memberId;
  });
}

/**
  * Update the league settings
  * @param leagueHash - the hash of the league
  * @param survivalCap - the new survival cap
  * @param draftTiming - the new draft timing
  * @param draftDate - the new draft date
  * @returns the updated league or undefined if not found
  * @throws an error if the user is not authorized
  * @throws an error if the draft timing cannot be updated
  */
export async function updateLeagueSettings(
  leagueHash: string,
  survivalCap?: number,
  draftTiming?: DraftTiming,
  draftDate?: Date
) {
  const { memberId, role } = await leagueMemberAuth(leagueHash);
  if (!memberId || role !== 'owner') throw new Error('User not authorized');

  // Check if the draft timing is valid for the season
  // Episode 2 date is 1 week after the premiere date, 
  // so doing some extra work technically by fetching 
  // the episode but it allows for a more dynamic solution 
  const res = await db
    .select({ premiereDate: seasonsSchema.premiereDate, episode2Date: episodesSchema.airDate })
    .from(seasonsSchema)
    .innerJoin(leaguesSchema, eq(leaguesSchema.leagueSeason, seasonsSchema.seasonId))
    .leftJoin(episodesSchema, and(
      eq(episodesSchema.seasonId, seasonsSchema.seasonId),
      eq(episodesSchema.episodeNumber, 2)))
    .where(eq(leaguesSchema.leagueHash, leagueHash))
    .then((res) => res[0]);

  if (!res) throw new Error('Season not found');
  const premiereDate = new Date(res.premiereDate);
  const episode2Date = res.episode2Date ?
    new Date(res.episode2Date) :
    // If episode 2 is not in the DB we make the best guess
    new Date(premiereDate).setDate(premiereDate.getDate() + 7);

  switch (draftTiming) {
    case 'Before Premier':
      if (premiereDate <= new Date()) throw new Error('Premiere date has already passed');
      if (draftDate && draftDate >= premiereDate) throw new Error('Draft date must be before the premiere date');
      break;
    case 'After Premier':
      if (episode2Date <= new Date()) throw new Error('Episode 2 has already aired');
      if (draftDate && draftDate <= premiereDate) throw new Error('Draft date must be after the premiere date');
      if (draftDate && draftDate >= episode2Date) throw new Error('Draft date must be before episode 2 airs');
      break;
  }

  // Error can be ignored, the where clause is not understood by the type system
  // eslint-disable-next-line drizzle/enforce-update-with-where
  const league = await db
    .update(leagueSettingsSchema)
    .set({ survivalCap, draftTiming, draftDate: draftDate?.toUTCString() })
    .from(leaguesSchema)
    .where(and(
      eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId),
      eq(leaguesSchema.leagueHash, leagueHash)))
    .returning({ draftTiming: leagueSettingsSchema.draftTiming, draftDate: leagueSettingsSchema.draftDate });

  if (!league[0]) throw new Error('League not found');

  return league[0];
}

/**
  * Update the draft order for a league
  * @param leagueHash - the hash of the league
  * @param draftOrder - the new draft order
  * @returns the updated league or undefined if not found
  * @throws an error if the user is not authorized
  * @throws an error if the draft order cannot be updated
  */
export async function updateDraftOrder(leagueHash: string, draftOrder: number[]) {
  const { memberId } = await leagueMemberAuth(leagueHash);
  if (!memberId) throw new Error('User not authorized');

  // Error can be ignored, the where clause is not understood by the type system
  // eslint-disable-next-line drizzle/enforce-update-with-where
  const league = await db
    .update(leagueSettingsSchema)
    .set({ draftOrder })
    .from(leaguesSchema)
    .where(and(
      eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId),
      eq(leaguesSchema.leagueHash, leagueHash)))
    .returning({ draftOrder: leagueSettingsSchema.draftOrder });

  if (!league[0]) throw new Error('League not found');

  return league[0];
}

/**
  * Update league member details
  * @param leagueHash - the hash of the league
  * @param member - the member to update
  * @returns the updated member or undefined if not found
  * @throws an error if the user is not authorized
  * @throws an error if the member cannot be updated
  */
export async function updateMemberDetails(leagueHash: string, member: LeagueMember) {
  const { userId } = await auth();
  // Note that league member auth would be redundant here
  if (!userId) throw new Error('User not authorized');

  // Error can be ignored, the where clause is not understood by the type system
  // eslint-disable-next-line drizzle/enforce-update-with-where
  const updatedMember = await db
    .update(leagueMembersSchema)
    .set(member)
    .from(leaguesSchema)
    .where(and(
      eq(leagueMembersSchema.leagueId, leaguesSchema.leagueId),
      eq(leaguesSchema.leagueHash, leagueHash),
      eq(leagueMembersSchema.memberId, member.memberId)))
    .returning({
      memberId: leagueMembersSchema.memberId,
      color: leagueMembersSchema.color,
      displayName: leagueMembersSchema.displayName,
      role: leagueMembersSchema.role,
    });

  if (!updatedMember[0]) throw new Error('Member not found');

  return updatedMember[0];
}

/** 
  * Update league admin list
  * @param leagueHash - the hash of the league
  * @param admins - the new list of admins
  * @returns the updated league or undefined if not found
  * @throws an error if the user is not authorized or not the owner
  * @throws an error if the admins cannot be updated
  */
export async function updateAdmins(leagueHash: string, admins: number[]) {
  const { memberId, role } = await leagueMemberAuth(leagueHash);
  // Note that league member auth would be redundant here
  if (!memberId || role !== 'owner') throw new Error('User not authorized');

  // Create transaction
  await db.transaction(async (trx) => {
    try {
      // Promote the new admins
      await trx
        .update(leagueMembersSchema)
        .set({ role: 'admin' })
        .from(leaguesSchema)
        .where(and(
          eq(leagueMembersSchema.leagueId, leaguesSchema.leagueId),
          eq(leaguesSchema.leagueHash, leagueHash),
          inArray(leagueMembersSchema.memberId, admins),
          eq(leagueMembersSchema.role, 'member')));

      // Demote the old admins not in the list
      await trx
        .update(leagueMembersSchema)
        .set({ role: 'member' })
        .from(leaguesSchema)
        .where(and(
          eq(leagueMembersSchema.leagueId, leaguesSchema.leagueId),
          eq(leaguesSchema.leagueHash, leagueHash),
          not(inArray(leagueMembersSchema.memberId, admins)),
          eq(leagueMembersSchema.role, 'admin')));
    } catch (error) {
      console.error('Error updating admins:', error);
      // Rollback the transaction
      trx.rollback();
      throw new Error('An error occurred while updating the admins. Please try again.');
    }
  });
}

