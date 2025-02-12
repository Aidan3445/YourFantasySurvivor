'use server';

import { auth } from '@clerk/nextjs/server';
import { type LeagueSettingsUpdate, type LeagueDraftTiming } from '~/server/db/defs/leagues';
import { db } from '~/server/db';
import { baseEventRulesSchema } from '~/server/db/schema/baseEvents';
import { type LeagueEventRule, type BaseEventRule } from '~/server/db/defs/events';
import { leagueSettingsSchema, leaguesSchema } from '~/server/db/schema/leagues';
import { and, eq, inArray, notInArray, } from 'drizzle-orm';
import { leagueMemberAuth } from '~/lib/auth';
import { leagueMembersSchema } from '~/server/db/schema/leagueMembers';
import { type LeagueMember, type NewLeagueMember } from '~/server/db/defs/leagueMembers';
import { seasonsSchema } from '~/server/db/schema/seasons';
import { episodesSchema } from '~/server/db/schema/episodes';
import { leagueEventsRulesSchema } from '~/server/db/schema/leagueEvents';

/**
  * Create a new league
  * @param league - the league to create
  * @param settings - the settings for the league
  * @param rules - the base event rules for the league
  * @param newMember - the new member to add
  * @returns the hash of the newly created league
  * @throws an error if the user is not authenticated
  * @throws an error if the league cannot be inserted
  * @throws an error if the league settings cannot be inserted
  * @throws an error if the base event rules cannot be inserted
  * @throws an error if the user cannot be added as a member
  */
export async function createNewLeague(
  leagueName: string,
  settings: { draftTiming: LeagueDraftTiming, survivalCap: number },
  rules: BaseEventRule,
  newMember: NewLeagueMember
): Promise<string> {
  const user = await auth();
  if (!user.userId) throw new Error('User not authenticated');

  // Get the season id
  // In future this will be a real fetch
  const seasonId = 11;

  // Create the league in a transaction
  const leagueHash = await db.transaction(async (trx) => {
    try {
      const insertedLeague = await trx
        .insert(leaguesSchema)
        .values({ leagueName, leagueSeason: seasonId })
        .returning({ leagueId: leaguesSchema.leagueId, leagueHash: leaguesSchema.leagueHash })
        .then((res) => res[0]);
      if (!insertedLeague) throw new Error('Failed to create league');

      // Safe to assume the league was inserted if we got this far
      // Get the league id and hash
      const { leagueId, leagueHash } = insertedLeague;

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

  return leagueHash;
}

/** 
  * Join a league
  * @param leagueHash - the hash of the league
  * @param newMember - the new member to add
  * @param userId - the id of the user
  * @throws an error if the user is not authenticated
  * @throws an error if the league cannot be found
  * @throws an error if the user is already a member of the league
  * @throws an error if the user cannot be added as a member
  */
export async function joinLeague(leagueHash: string, newMember: NewLeagueMember) {
  const user = await auth();
  if (!user.userId) throw new Error('User not authenticated');

  // Transaction to join the league
  await db.transaction(async (trx) => {
    try {
      const { leagueId, draftOrder } = await trx
        .select({ leagueId: leaguesSchema.leagueId, draftOrder: leagueSettingsSchema.draftOrder })
        .from(leaguesSchema)
        .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId))
        .where(eq(leaguesSchema.leagueHash, leagueHash))
        .then((res) => ({ leagueId: res[0]?.leagueId, draftOrder: res[0]?.draftOrder }));
      if (!leagueId || !draftOrder) throw new Error('League not found');

      // Try to add the member, if there is a conflict, the user is already a member
      const memberId = await trx
        .insert(leagueMembersSchema)
        .values({ leagueId, userId: user.userId, ...newMember })
        .returning({ memberId: leagueMembersSchema.memberId })
        .then((res) => res[0]?.memberId);
      if (!memberId) throw new Error('Failed to add user as a member');

      // Add the member to the draft order
      draftOrder.push(memberId);
      await trx
        .update(leagueSettingsSchema)
        .set({ draftOrder })
        .where(eq(leagueSettingsSchema.leagueId, leagueId));
    } catch (error) {
      console.error('Error joining league:', error);
      // Rollback the transaction
      trx.rollback();
      throw new Error('An error occurred while joining the league. Please try again.');
    }
  });
}

/**
  * Update the league settings
  * @param leagueHash - the hash of the league
  * @param update - the settings to update
  * @throws an error if the user is not authorized
  * @throws an error if the draft timing cannot be updated
  */
export async function updateLeagueSettings(
  leagueHash: string,
  update: LeagueSettingsUpdate
) {
  const { role } = await leagueMemberAuth(leagueHash);
  if (!role || role !== 'Owner') throw new Error('User not authorized');

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

  const { leagueName, survivalCap, draftTiming, draftDate } = update;
  console.log(update);

  if (draftTiming && !draftDate) throw new Error('Draft date is required with draft timing');
  if (!draftTiming && draftDate) throw new Error('Draft timing is required with draft date');
  if (draftTiming && draftDate) {
    const premiereDate = new Date(res.premiereDate);
    const episode2Date = res.episode2Date ?
      new Date(res.episode2Date) :
      // If episode 2 is not in the DB we make the best guess
      new Date(premiereDate).setDate(premiereDate.getDate() + 7);

    switch (draftTiming) {
      case 'Before Premiere':
        if (premiereDate <= new Date()) throw new Error('Premiere date has already passed');
        if (draftDate && draftDate >= premiereDate) throw new Error('Draft date must be before the premiere date');
        break;
      case 'After Premiere':
        if (episode2Date <= new Date()) throw new Error('Episode 2 has already aired');
        if (draftDate && draftDate <= premiereDate) throw new Error('Draft date must be after the premiere date');
        if (draftDate && draftDate >= episode2Date) throw new Error('Draft date must be before episode 2 airs');
        break;
    }
  }

  // Transaction to update the league settings
  await db.transaction(async (trx) => {
    try {
      // Error can be ignored, the where clause is not understood by the type system
      // eslint-disable-next-line drizzle/enforce-update-with-where
      await trx
        .update(leagueSettingsSchema)
        .set({ survivalCap, draftTiming, draftDate: draftDate?.toUTCString() })
        .from(leaguesSchema)
        .where(and(
          eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId),
          eq(leaguesSchema.leagueHash, leagueHash)));

      if (!leagueName) return;
      await trx
        .update(leaguesSchema)
        .set({ leagueName })
        .where(eq(leaguesSchema.leagueHash, leagueHash))
        .returning({ leagueName: leaguesSchema.leagueName })
        .then((res) => res[0]);
    } catch (error) {
      console.error('Error updating league settings:', error);
      // Rollback the transaction
      trx.rollback();
      throw new Error('An error occurred while updating the league settings. Please try again.');
    }
  });
}

/**
  * Update the base event rules for a league
  * @param leagueHash - the hash of the league
  * @param rules - the new base event rules
  * @throws an error if the user is not authorized
  * @throws an error if the rules cannot be updated
  */
export async function updateBaseEventRules(leagueHash: string, rules: BaseEventRule) {
  const { role } = await leagueMemberAuth(leagueHash);
  if (!role || role !== 'Owner') throw new Error('User not authorized');

  // Error can be ignored, the where clause is not understood by the type system
  // eslint-disable-next-line drizzle/enforce-update-with-where
  await db
    .update(baseEventRulesSchema)
    .set(rules)
    .from(leaguesSchema)
    .where(and(
      eq(baseEventRulesSchema.leagueId, leaguesSchema.leagueId),
      eq(leaguesSchema.leagueHash, leagueHash)));
}

/**
  * Update the draft order for a league
  * @param leagueHash - the hash of the league
  * @param draftOrder - the new draft order
  * @throws an error if the user is not authorized
  * @throws an error if the draft order cannot be updated
  */
export async function updateDraftOrder(leagueHash: string, draftOrder: number[]) {
  const { role } = await leagueMemberAuth(leagueHash);
  if (!role || role !== 'Owner') throw new Error('User not authorized');

  // Error can be ignored, the where clause is not understood by the type system
  // eslint-disable-next-line drizzle/enforce-update-with-where
  await db
    .update(leagueSettingsSchema)
    .set({ draftOrder })
    .from(leaguesSchema)
    .where(and(
      eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId),
      eq(leaguesSchema.leagueHash, leagueHash)));
}

/**
  * Update league member details
  * @param leagueHash - the hash of the league
  * @param member - the member to update
  * @returns the hash of the updated league
  * @throws an error if the user is not authorized
  * @throws an error if the member cannot be updated
  */
export async function updateMemberDetails(leagueHash: string, member: LeagueMember) {
  const { userId } = await auth();
  // Note that league member auth would be redundant here
  if (!userId) throw new Error('User not authorized');

  // Error can be ignored, the where clause is not understood by the type system
  // eslint-disable-next-line drizzle/enforce-update-with-where
  await db
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
}

/** 
  * Update league admin list
  * @param leagueHash - the hash of the league
  * @param admins - the new list of admins
  * @throws an error if the user is not authorized or not the owner
  * @throws an error if the admins cannot be updated
  */
export async function updateAdmins(leagueHash: string, admins: number[]) {
  const { role } = await leagueMemberAuth(leagueHash);
  if (!role || role !== 'Owner') throw new Error('User not authorized');

  // Create transaction
  await db.transaction(async (trx) => {
    try {
      // Demote the old admins not in the list
      await trx
        .update(leagueMembersSchema)
        .set({ role: 'Member' })
        .from(leaguesSchema)
        .where(and(
          eq(leagueMembersSchema.leagueId, leaguesSchema.leagueId),
          eq(leaguesSchema.leagueHash, leagueHash),
          notInArray(leagueMembersSchema.memberId, admins),
          eq(leagueMembersSchema.role, 'Admin')));
      // Promote the new admins - also 're-promotes' existing admins
      const newAdmins = await trx
        .update(leagueMembersSchema)
        .set({ role: 'Admin' })
        .from(leaguesSchema)
        .where(and(
          eq(leagueMembersSchema.leagueId, leaguesSchema.leagueId),
          eq(leaguesSchema.leagueHash, leagueHash),
          inArray(leagueMembersSchema.memberId, admins)))
        .returning({ memberId: leagueMembersSchema.memberId });

      // Validate the number of admins
      if (newAdmins.length !== admins.length) {
        throw new Error('Failed to update admins');
      }
    } catch (error) {
      console.error('Error updating admins:', error);
      // Rollback the transaction
      trx.rollback();
      throw new Error('An error occurred while updating the admins. Please try again.');
    }
  });
}

/**
  * Create a new league event rule
  * @param leagueHash - the hash of the league
  * @param rule - the rule to create
  * @throws an error if the user is not authorized
  * @throws an error if the rule cannot be created
  */
export async function createLeagueEventRule(leagueHash: string, rule: LeagueEventRule) {
  const { role } = await leagueMemberAuth(leagueHash);
  if (!role || role !== 'Owner') throw new Error('User not authorized');

  // Transaction to create the rule
  await db.transaction(async (trx) => {
    const { leagueId } = await trx
      .select({ leagueId: leaguesSchema.leagueId })
      .from(leaguesSchema)
      .where(eq(leaguesSchema.leagueHash, leagueHash))
      .then((res) => ({ leagueId: res[0]?.leagueId }));
    if (!leagueId) throw new Error('League not found');


    // Error can be ignored, the where clause is not understood by the type system
    // eslint-disable-next-line drizzle/enforce-update-with-where
    await trx
      .insert(leagueEventsRulesSchema)
      .values({ ...rule, leagueId });
  });
}

/**
  * Update a league event rule
  * @param leagueHash - the hash of the league
  * @param rule - the rule to update
  * @throws an error if the user is not authorized
  * @throws an error if the rule cannot be updated
  */
export async function updateLeagueEventRule(leagueHash: string, rule: LeagueEventRule) {
  const { role } = await leagueMemberAuth(leagueHash);
  if (!role || role !== 'Owner') throw new Error('User not authorized');

  // Error can be ignored, the where clause is not understood by the type system
  // eslint-disable-next-line drizzle/enforce-update-with-where
  await db
    .update(leagueEventsRulesSchema)
    .set(rule)
    .from(leaguesSchema)
    .where(and(
      eq(leagueEventsRulesSchema.leagueId, leaguesSchema.leagueId),
      eq(leaguesSchema.leagueHash, leagueHash),
      eq(leagueEventsRulesSchema.eventName, rule.eventName)));
}
