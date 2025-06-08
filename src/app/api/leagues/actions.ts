'use server';

import { type LeagueHash, type LeagueName, type LeagueSettingsUpdate } from '~/server/db/defs/leagues';
import { db } from '~/server/db';
import { baseEventReferenceSchema, baseEventRulesSchema, baseEventsSchema } from '~/server/db/schema/baseEvents';
import { type ReferenceType, type BaseEventRule, type LeagueEventRule, type LeagueEventInsert, type LeagueEventId } from '~/server/db/defs/events';
import { leagueSettingsSchema, leaguesSchema } from '~/server/db/schema/leagues';
import { and, asc, desc, eq, inArray, notInArray, } from 'drizzle-orm';
import { auth, leagueMemberAuth } from '~/lib/auth';
import { leagueMembersSchema, selectionUpdatesSchema } from '~/server/db/schema/leagueMembers';
import { type LeagueMember, type LeagueMemberId, type NewLeagueMember } from '~/server/db/defs/leagueMembers';
import { seasonsSchema } from '~/server/db/schema/seasons';
import { episodesSchema } from '~/server/db/schema/episodes';
import { leagueEventPredictionsSchema, leagueEventsRulesSchema, leagueEventsSchema } from '~/server/db/schema/leagueEvents';
import { type CastawayId } from '~/server/db/defs/castaways';
import { castawaysSchema } from '~/server/db/schema/castaways';
import { type EpisodeId } from '~/server/db/defs/episodes';
import { type TribeId } from '~/server/db/defs/tribes';
import { QUERIES } from './query';
import { leagueChatSchema } from '~/server/db/schema/leagueChat';

/**
  * Create a new league
  * @param league - the league to create
  * @param settings - the settings for the league
  * @param rules - the base event rules for the league
  * @param newMember - the new member to add
  * @returns the league info of the league created
  * @throws an error if the user is not authenticated
  * @throws an error if the league cannot be inserted
  * @throws an error if the league settings cannot be inserted
  * @throws an error if the base event rules cannot be inserted
  * @throws an error if the user cannot be added as a member
  */
export async function createNewLeague(
  leagueName: LeagueName,
  newMember: NewLeagueMember,
  draftDate?: Date
) {
  const { userId } = await auth();
  if (!userId) throw new Error('User not authenticated');

  // Create the league in a transaction
  return await db.transaction(async (trx) => {
    try {
      // Get the current season
      const { seasonId, seasonName } = await trx
        .select({
          seasonId: seasonsSchema.seasonId,
          seasonName: seasonsSchema.seasonName,
        })
        .from(seasonsSchema)
        .orderBy(desc(seasonsSchema.premiereDate))
        .then((res) => ({ ...res[0] }));
      if (!seasonId) throw new Error('Season not found');

      const insertedLeague = await trx
        .insert(leaguesSchema)
        .values({ leagueName, leagueSeason: seasonId })
        .returning({
          leagueId: leaguesSchema.leagueId,
          leagueHash: leaguesSchema.leagueHash,
          leagueStatus: leaguesSchema.leagueStatus,
        })
        .then((res) => res[0]);
      if (!insertedLeague) throw new Error('Failed to create league');

      // Safe to assume the league was inserted if we got this far
      // Get the league id and hash
      const { leagueId, leagueHash, leagueStatus } = insertedLeague;

      // Insert the owner as a member
      const memberId = await trx
        .insert(leagueMembersSchema)
        .values({ leagueId, userId: userId, ...newMember })
        .returning({ memberId: leagueMembersSchema.memberId })
        .then((res) => res[0]?.memberId);
      if (!memberId) throw new Error('Failed to add user as a member');

      // Insert the league settings
      await trx
        .insert(leagueSettingsSchema)
        .values({ leagueId, draftDate: draftDate?.toUTCString(), draftOrder: [memberId] });

      return {
        leagueName,
        leagueHash,
        leagueStatus,
        season: seasonName!,
        castaway: null,
      };
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
  * @returns the league info of the league joined
  * @throws an error if the user is not authenticated
  * @throws an error if the league cannot be found
  * @throws an error if the user is already a member of the league
  * @throws an error if the user cannot be added as a member
  * @throws an error if the league is not in the predraft status
  */
export async function joinLeague(leagueHash: LeagueHash, newMember: NewLeagueMember) {
  const { userId } = await auth();
  if (!userId) throw new Error('User not authenticated');

  // Transaction to join the league
  return await db.transaction(async (trx) => {
    try {
      const { leagueId, draftOrder, leagueInfo } = await trx
        .select({
          leagueId: leaguesSchema.leagueId,
          draftOrder: leagueSettingsSchema.draftOrder,
          leagueInfo: {
            leagueName: leaguesSchema.leagueName,
            leagueHash: leaguesSchema.leagueHash,
            leagueStatus: leaguesSchema.leagueStatus,
            season: seasonsSchema.seasonName,
          }
        })
        .from(leaguesSchema)
        .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId))
        .innerJoin(seasonsSchema, eq(seasonsSchema.seasonId, leaguesSchema.leagueSeason))
        .where(eq(leaguesSchema.leagueHash, leagueHash))
        .then((res) => ({
          ...res[0],
          leagueInfo: {
            ...res[0]!.leagueInfo,
            castaway: null,
          }
        }));
      if (!leagueId || !draftOrder) throw new Error('League not found');

      if (leagueInfo.leagueStatus !== 'Predraft') {
        throw new Error('Cannot join after the draft has started');
      }

      // Try to add the member, if there is a conflict, the user is already a member
      const memberId = await trx
        .insert(leagueMembersSchema)
        .values({ leagueId, userId: userId, ...newMember })
        .returning({ memberId: leagueMembersSchema.memberId })
        .then((res) => res[0]?.memberId);
      if (!memberId) throw new Error('Failed to add user as a member');

      // Add the member to the draft order
      draftOrder.push(memberId);
      await trx
        .update(leagueSettingsSchema)
        .set({ draftOrder })
        .where(eq(leagueSettingsSchema.leagueId, leagueId));

      return leagueInfo;
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
  leagueHash: LeagueHash,
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

  const { leagueName, survivalCap, draftDate } = update;

  // Transaction to update the league settings
  await db.transaction(async (trx) => {
    try {
      // Error can be ignored, the where clause is not understood by the type system
      // eslint-disable-next-line drizzle/enforce-update-with-where
      await trx
        .update(leagueSettingsSchema)
        .set({ survivalCap, draftDate: draftDate === null ? null : draftDate?.toUTCString() })
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
export async function updateBaseEventRules(leagueHash: LeagueHash, rules: BaseEventRule) {
  const { role, league } = await leagueMemberAuth(leagueHash);
  if (!role || role !== 'Owner' || !league) throw new Error('User not authorized');

  // See if the league is still using the default rules
  const noRulesSet = await db
    .select({ leagueId: baseEventRulesSchema.leagueId })
    .from(baseEventRulesSchema)
    .where(eq(baseEventRulesSchema.leagueId, league.leagueId))
    .then((res) => !res[0]?.leagueId);

  // if no rules we're inserting
  if (noRulesSet) {
    await db
      .insert(baseEventRulesSchema)
      .values({ ...rules, leagueId: league.leagueId });
    return;
  }

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
export async function updateDraftOrder(leagueHash: LeagueHash, draftOrder: number[]) {
  const { role } = await leagueMemberAuth(leagueHash);
  if (!role || role !== 'Owner') throw new Error('User not authorized');

  // Error can be ignored, the where clause is not understood by the type system
  // eslint-disable-next-line drizzle/enforce-update-with-where
  const updated = await db
    .update(leagueSettingsSchema)
    .set({ draftOrder })
    .from(leaguesSchema)
    .where(and(
      eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId),
      eq(leaguesSchema.leagueHash, leagueHash),
      eq(leaguesSchema.leagueStatus, 'Predraft')))
    .returning({ draftOrder: leagueSettingsSchema.draftOrder })
    .then((res) => !!res[0]);

  if (!updated) throw new Error('Draft order cannot be updated');
}

/**
  * Update league member details
  * @param leagueHash - the hash of the league
  * @param member - the member to update
  * @returns the hash of the updated league
  * @throws an error if the user is not authorized
  * @throws an error if the member cannot be updated
  */
export async function updateMemberDetails(leagueHash: LeagueHash, member: LeagueMember) {
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
export async function updateAdmins(leagueHash: LeagueHash, admins: number[]) {
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
export async function createLeagueEventRule(leagueHash: LeagueHash, rule: LeagueEventRule) {
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
export async function updateLeagueEventRule(leagueHash: LeagueHash, rule: LeagueEventRule) {
  const { role } = await leagueMemberAuth(leagueHash);
  if (!role || role !== 'Owner') throw new Error('User not authorized');

  // Error can be ignored, the where clause is not understood by the type system
  // eslint-disable-next-line drizzle/enforce-update-with-where
  const update = await db
    .update(leagueEventsRulesSchema)
    .set(rule)
    .from(leaguesSchema)
    .where(and(
      eq(leagueEventsRulesSchema.leagueId, leaguesSchema.leagueId),
      eq(leaguesSchema.leagueHash, leagueHash),
      eq(leagueEventsRulesSchema.leagueEventRuleId, rule.leagueEventRuleId!)))
    .returning({ leagueEventRuleId: leagueEventsRulesSchema.leagueEventRuleId })
    .then(res => res[0]);
  if (!update) throw new Error('Rule not found');
}

/**
  * Delete a league event rule
  * @param leagueHash - the hash of the league
  * @param LeagueEventRule - the rule to delete
  * @throws an error if the user is not authorized
  * @throws an error if the rule cannot be deleted
  */
export async function deleteLeagueEventRule(leagueHash: LeagueHash, eventName: string) {
  const { role, league } = await leagueMemberAuth(leagueHash);
  if (!role || role !== 'Owner' || !league) throw new Error('User not authorized');

  const deleted = await db
    .delete(leagueEventsRulesSchema)
    .where(and(
      // DB keeps unique constraints on leagueId and eventName
      eq(leagueEventsRulesSchema.leagueId, league.leagueId),
      eq(leagueEventsRulesSchema.eventName, eventName)))
    .returning({ leagueEventRuleId: leagueEventsRulesSchema.leagueEventRuleId })
    .then(res => res[0]);
  if (!deleted) throw new Error('Rule not found');
}

/**
  * Choose a castaway, either in the draft or as a selection update
  * @param leagueHash - the hash of the league
  * @param castawayId - the id of the castaway
  * @param isDraft - whether the castaway is being chosen in the draft
  * @throws an error if the user is not authorized
  * @throws an error if the castaway cannot be chosen
  */
export async function chooseCastaway(leagueHash: LeagueHash, castawayId: CastawayId, isDraft: boolean) {
  const { memberId } = await leagueMemberAuth(leagueHash);
  if (!memberId) throw new Error('User not authorized');

  // castaways that are not eliminated
  const survivingCastawaysPromise = db
    .select({ castawayId: castawaysSchema.castawayId })
    .from(castawaysSchema)
    .innerJoin(seasonsSchema, eq(seasonsSchema.seasonId, castawaysSchema.seasonId))
    .innerJoin(leaguesSchema, and(
      eq(leaguesSchema.leagueSeason, seasonsSchema.seasonId),
      eq(leaguesSchema.leagueHash, leagueHash)))
    // still in the game
    .leftJoin(baseEventReferenceSchema, and(
      eq(baseEventReferenceSchema.referenceId, castawaysSchema.castawayId),
      eq(baseEventReferenceSchema.referenceType, 'Castaway')))
    .leftJoin(baseEventsSchema, and(
      eq(baseEventsSchema.baseEventId, baseEventReferenceSchema.baseEventId),
      notInArray(baseEventsSchema.eventName, ['elim', 'noVoteExit'])))
    .then((res) => res.map(({ castawayId }) => castawayId));

  // member selection history for the league
  const currentSelectionsPromise = db
    .select({
      castawayId: selectionUpdatesSchema.castawayId,
      memberId: selectionUpdatesSchema.memberId,
    })
    .from(selectionUpdatesSchema)
    .innerJoin(leagueMembersSchema, eq(leagueMembersSchema.memberId, selectionUpdatesSchema.memberId))
    .innerJoin(leaguesSchema, eq(leaguesSchema.leagueId, leagueMembersSchema.leagueId))
    .innerJoin(episodesSchema, eq(episodesSchema.episodeId, selectionUpdatesSchema.episodeId))
    .where(eq(leaguesSchema.leagueHash, leagueHash))
    .orderBy(asc(episodesSchema.episodeNumber))
    .then((res) => Object.values(res.reduce((acc, { castawayId, memberId }) => {
      acc[memberId] = castawayId;
      return acc;
    }, {} as Record<LeagueMemberId, CastawayId>)));

  // next episode id to air
  const nextEpisodePromise = QUERIES.getEpisodes(leagueHash, 100)
    .then((episodes) => episodes.find((episode) => episode.airStatus === 'Upcoming'));

  // draft order of the league
  const draftOrderPromise = db
    .select({ draftOrder: leagueSettingsSchema.draftOrder })
    .from(leaguesSchema)
    .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId))
    .where(eq(leaguesSchema.leagueHash, leagueHash))
    .then((res) => res[0]?.draftOrder);


  const [surviving, selections, nextEpisode, draftOrder] = await Promise.all([
    survivingCastawaysPromise,
    currentSelectionsPromise,
    nextEpisodePromise,
    draftOrderPromise
  ]);

  if (!surviving.includes(castawayId)) throw new Error('Castaway has been eliminated');
  if (selections.includes(castawayId)) throw new Error('Castaway already chosen');
  if (!nextEpisode) throw new Error('Next episode not found');

  // If drafting ensure order is correct
  if (!draftOrder || isDraft && draftOrder.findIndex((id) => id === memberId) !== selections.length) {
    throw new Error('Not your turn to draft');
  }

  // update or insert selection
  await db
    .insert(selectionUpdatesSchema)
    .values({
      castawayId,
      memberId,
      episodeId: nextEpisode.episodeId,
      draft: isDraft,
    })
    .onConflictDoUpdate({
      target: [selectionUpdatesSchema.memberId, selectionUpdatesSchema.episodeId],
      set: { castawayId },
    });

  // see if the draft is complete
  if (isDraft && draftOrder.length === selections.length + 1) {
    await db
      .update(leaguesSchema)
      .set({ leagueStatus: 'Active' })
      .where(eq(leaguesSchema.leagueHash, leagueHash));
  }
}

/**
  * Make a league event prediction or update an existing prediction if it exists
  * @param leagueHash - the hash of the league
  * @param rule - the rule to predict
  * @param referenceId - the id of the reference (castaway, tribe, member)
  * @param episodeId - the id of the episode (optional)
  * @throws an error if the user is not authorized
  * @throws an error if the prediction cannot be made
  */
export async function makePrediction(
  leagueHash: LeagueHash,
  rule: LeagueEventRule,
  referenceType: ReferenceType,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
  referenceId: CastawayId | TribeId | LeagueMemberId,
  episodeId?: EpisodeId,
) {
  const { memberId, league } = await leagueMemberAuth(leagueHash);
  if (!memberId || !league) throw new Error('User not authorized');

  const episodes = await QUERIES.getEpisodes(leagueHash, 100);
  if (!episodes || episodes.length === 0) throw new Error('Episodes not found');
  const nextEpisode = episodes.find((episode) => episode.airStatus === 'Upcoming');
  if (!nextEpisode) throw new Error('Next episode not found');
  episodeId ??= nextEpisode.episodeId;

  /*
  let timing: LeagueEventTiming | undefined;
  const lastEpisode = episodes[nextEpisode.episodeNumber - 2];
  const mergeEpisode = episodes.find((episode) => episode.isMerge);

  // Draft takes precedence if included in the list: 
  // - if the league is in draft status
  // - if there are no previous episodes
  // - if the draft date is after the last aired episode
  if (rule.timing.includes('Draft') &&
    (league.leagueStatus === 'Draft' || !lastEpisode ||
      league.draftDate > lastEpisode.episodeAirDate)) timing = 'Draft';
  // Weekly takes precedence if included in the list and draft checks fail
  else if (rule.timing.includes('Weekly')) timing = 'Weekly';
  // Likewise for weekly premerge and postmerge
  // Weekly premerge only if included in the list and no merge episode
  else if (rule.timing.includes('Weekly (Premerge only)') &&
    !mergeEpisode) timing = 'Weekly (Premerge only)';
  // Weekly postmerge only if included in the list and merge episode exists
  else if (rule.timing.includes('Weekly (Postmerge only)') &&
    !!mergeEpisode) timing = 'Weekly (Postmerge only)';
  // After merge only if included in the list and merge episode is last aired
  else if (rule.timing.includes('After Merge') &&
    !!lastEpisode?.isMerge) timing = 'After Merge';
  // Before finale only if included in the list and next episode is the finale
  else if (rule.timing.includes('Before Finale') &&
    !!nextEpisode?.isFinale) timing = 'Before Finale';
 
  if (!timing || league.leagueStatus === 'Inactive') {
    throw new Error('This prediction cannot be made at this time');
  }
  */

  await db
    .insert(leagueEventPredictionsSchema)
    .values({
      leagueEventRuleId: rule.leagueEventRuleId!,
      episodeId,
      memberId,
      referenceType,
      referenceId,
    })
    .onConflictDoUpdate({
      target: [
        leagueEventPredictionsSchema.leagueEventRuleId,
        leagueEventPredictionsSchema.episodeId,
        leagueEventPredictionsSchema.memberId,
      ],
      set: { referenceType, referenceId },
    });
}

/**
  * Create a new custom/league event for the season
  * @param leagueHash hash of the league to create the event for
  * @param leagueEvent event to create
  * @throws if the user is not a system admin
  * @throws if the event cannot be created
  */
export async function createLeagueEvent(leagueHash: LeagueHash, leagueEvent: LeagueEventInsert) {
  const { memberId, role } = await leagueMemberAuth(leagueHash);
  if (!memberId || role === 'Member') throw new Error('User not authorized');

  // ensure the rule is in the league
  const rule = await db
    .select({ leagueEventRuleId: leagueEventsRulesSchema.leagueEventRuleId })
    .from(leagueEventsRulesSchema)
    .innerJoin(leaguesSchema, eq(leaguesSchema.leagueId, leagueEventsRulesSchema.leagueId))
    .where(and(
      eq(leaguesSchema.leagueHash, leagueHash),
      eq(leagueEventsRulesSchema.leagueEventRuleId, leagueEvent.leagueEventRuleId)))
    .then((res) => res[0]);
  if (!rule) throw new Error('Rule not found');

  // insert the league event
  const leagueEventId = await db
    .insert(leagueEventsSchema)
    .values(leagueEvent)
    .returning({ leagueEventId: leagueEventsSchema.leagueEventId })
    .then((result) => result[0]?.leagueEventId);
  if (!leagueEventId) throw new Error('Failed to create league event');
}

/**
  * Update a base event for the season
  * @param leagueHash hash of the league to update the event for
  * @param leagueEvent event to update
  * @throws if the user is not a system admin
  * @throws if the event cannot be updated
  */
export async function updateLeagueEvent(
  leagueHash: LeagueHash,
  leagueEventId: LeagueEventId,
  leagueEvent: LeagueEventInsert
) {
  const { memberId, role, league } = await leagueMemberAuth(leagueHash);
  if (!memberId || role === 'Member') throw new Error('User not authorized');

  // ensure the rule is in the league
  const rule = await db
    .select({ leagueEventRuleId: leagueEventsRulesSchema.leagueEventRuleId })
    .from(leagueEventsRulesSchema)
    .where(and(
      eq(leagueEventsRulesSchema.leagueId, league!.leagueId),
      eq(leagueEventsRulesSchema.leagueEventRuleId, leagueEvent.leagueEventRuleId)))
    .then((res) => res[0]);
  if (!rule) throw new Error('Rule not found');

  // update the base event
  await db
    .update(leagueEventsSchema)
    .set(leagueEvent)
    .where(eq(leagueEventsSchema.leagueEventId, leagueEventId));
}

/**
  * Delete a base event for the season
  * @param leagueHash hash of the league to delete the event for
  * @param leagueEvent event to delete
  * @throws if the user is not an admin or owner of the league
  * @throws if the event cannot be deleted
  */
export async function deleteLeagueEvent(leagueHash: LeagueHash, leagueEventId: number) {
  const { memberId, role } = await leagueMemberAuth(leagueHash);
  if (!memberId || role === 'Member') throw new Error('User not authorized');

  // unlike update and insert, cascade delete will take care of deleting
  // the references as well, nice!
  await db
    .delete(leagueEventsSchema)
    .where(eq(leagueEventsSchema.leagueEventId, leagueEventId));
}

/**
  * Save a chat message to the database
  * @param leagueHash - the hash of the league
  * @param text - the text of the message
  * @param timestamp - the timestamp of the message
  * @returns the serial of the message
  * @throws an error if the user is not authorized
  * @throws an error if the message cannot be saved
  */
export async function saveChatMessage(leagueHash: LeagueHash, message: { serial: string, text: string, timestamp: string }) {
  const { memberId } = await leagueMemberAuth(leagueHash);
  if (!memberId) throw new Error('User not authorized');

  // Insert the message into the database
  const entry = await db
    .insert(leagueChatSchema)
    .values({
      leagueHash,
      sentById: memberId,
      ...message,
    })
    .returning({ serial: leagueChatSchema.serial })
    .then((res) => res[0]?.serial);

  if (!entry) throw new Error('Failed to save chat message');

  return entry;
}


