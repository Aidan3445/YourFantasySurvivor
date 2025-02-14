import 'server-only';

import { aliasedTable, and, arrayContained, asc, eq, sql } from 'drizzle-orm';
import { db } from '~/server/db';
import { leagueSettingsSchema, leaguesSchema } from '~/server/db/schema/leagues';
import { leagueMembersSchema, selectionUpdatesSchema } from '~/server/db/schema/leagueMembers';
import { seasonsSchema } from '~/server/db/schema/seasons';
import { leagueMemberAuth } from '~/lib/auth';
import { baseEventReferenceSchema, baseEventRulesSchema, baseEventsSchema } from '~/server/db/schema/baseEvents';
import { leagueEventsRulesSchema } from '~/server/db/schema/leagueEvents';
import { auth } from '@clerk/nextjs/server';
import { episodesSchema } from '~/server/db/schema/episodes';
import { castawaysSchema } from '~/server/db/schema/castaways';
import { type LeagueHash, type LeagueName } from '~/server/db/defs/leagues';
import { type SeasonName } from '~/server/db/defs/seasons';
import { type CastawayDraftInfo, type CastawayName } from '~/server/db/defs/castaways';
import { tribesSchema } from '~/server/db/schema/tribes';

export const QUERIES = {
  /**
   * Get a league by its hash
   * @param leagueHash - the hash of the league
   * @param membersOnly - if true, authentication only allows members
   * the league will not be returned if the user is not a member
   * @returns the league or undefined if it does not exist
   * @throws an error if the user is not authenticated
   */
  getLeague: async function(leagueHash: LeagueHash) {
    const { userId, memberId } = await leagueMemberAuth(leagueHash);
    // If the user is not authenticated, throw an error
    if (!userId) {
      throw new Error('User not authenticated');
    }
    // If the user is not a member of the league return undefined
    if (!memberId) {
      return undefined;
    }

    const leaguePromise = db
      .select({
        leagueName: leaguesSchema.leagueName,
        leagueHash: leaguesSchema.leagueHash,
        leagueStatus: leaguesSchema.leagueStatus,
        season: seasonsSchema.seasonName,
        settings: leagueSettingsSchema,
        baseEventRules: baseEventRulesSchema
      })
      .from(leaguesSchema)
      .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId))
      .innerJoin(seasonsSchema, eq(seasonsSchema.seasonId, leaguesSchema.leagueSeason))
      .innerJoin(baseEventRulesSchema, eq(baseEventRulesSchema.leagueId, leaguesSchema.leagueId))
      .where(eq(leaguesSchema.leagueHash, leagueHash))
      .then((leagues) => leagues[0]);

    const membersPromise = db
      .select({
        memberId: leagueMembersSchema.memberId,
        color: leagueMembersSchema.color,
        displayName: leagueMembersSchema.displayName,
        role: leagueMembersSchema.role,
      })
      .from(leagueMembersSchema)
      .innerJoin(leaguesSchema, eq(leaguesSchema.leagueId, leagueMembersSchema.leagueId))
      .where(eq(leaguesSchema.leagueHash, leagueHash));

    const leagueEventRulesPromise = db
      .select({
        eventName: leagueEventsRulesSchema.eventName,
        description: leagueEventsRulesSchema.description,
        points: leagueEventsRulesSchema.points,
        type: leagueEventsRulesSchema.type,
        timing: leagueEventsRulesSchema.timing,
        public: leagueEventsRulesSchema.public,
      })
      .from(leagueEventsRulesSchema)
      .innerJoin(leaguesSchema, eq(leaguesSchema.leagueId, leagueEventsRulesSchema.leagueId))
      .where(eq(leaguesSchema.leagueHash, leagueHash));


    const [league, membersList, customEventRules] = await Promise.all([
      leaguePromise, membersPromise, leagueEventRulesPromise
    ]);

    if (!league) {
      return undefined;
    }

    const members = {
      loggedIn: membersList.find((member) => member.memberId === memberId),
      list: membersList,
    };

    return {
      ...league,
      settings: {
        ...league.settings,
        draftOver: !!(league.settings.draftDate && new Date() > new Date(league.settings.draftDate)),
        draftDate: league.settings.draftDate ? new Date(league.settings.draftDate + 'Z') : null,
      },
      members,
      customEventRules,
    };
  },

  /**
    * Get the leagues that you're a member of
    * @returns the leagues you're a member of
    */
  getLeagues: async function() {
    const { userId } = await auth();
    // If the user is not authenticated, return an empty array
    if (!userId) {
      return [];
    }

    const leagues = await db
      .select({
        leagueName: leaguesSchema.leagueName,
        leagueHash: leaguesSchema.leagueHash,
        leagueStatus: leaguesSchema.leagueStatus,
        season: seasonsSchema.seasonName,
        castaway: castawaysSchema.fullName,
      })
      .from(leagueMembersSchema)
      .innerJoin(leaguesSchema, eq(leaguesSchema.leagueId, leagueMembersSchema.leagueId))
      .innerJoin(seasonsSchema, eq(seasonsSchema.seasonId, leaguesSchema.leagueSeason))
      .leftJoin(selectionUpdatesSchema, eq(selectionUpdatesSchema.memberId, leagueMembersSchema.memberId))
      .leftJoin(episodesSchema, and(
        eq(episodesSchema.episodeId, selectionUpdatesSchema.episodeId),
        eq(episodesSchema.episodeNumber,
          // I have no clue why MIN works but MAX doesn't but alas
          db.select({ maxEpisode: sql`MIN(${episodesSchema.episodeNumber})` })
            .from(selectionUpdatesSchema)
            .innerJoin(episodesSchema, eq(episodesSchema.episodeId, selectionUpdatesSchema.episodeId))
            .where(eq(selectionUpdatesSchema.memberId, leagueMembersSchema.memberId))
        )))
      .leftJoin(castawaysSchema, eq(castawaysSchema.castawayId, selectionUpdatesSchema.castawayId))
      .where(eq(leagueMembersSchema.userId, userId))
      .orderBy(asc(episodesSchema.episodeNumber))
      .then((leagues) => leagues.reduce((acc, league) => {
        const existing = acc.find((l) => l.leagueHash === league.leagueHash);
        if (existing) {
          existing.castaway = league.castaway;
        } else {
          acc.push(league);
        }
        return acc;
      }, [] as {
        leagueName: LeagueName,
        leagueHash: LeagueHash,
        season: SeasonName,
        castaway: CastawayName | null,
      }[]));

    return leagues;
  },

  /**
    * Get the league colors only for joining the league
    * @param leagueHash - the hash of the league
    * @returns the league or undefined if the user is already a member
    * @throws an error if the user is not authenticated
    */
  getLeagueJoin: async function(leagueHash: string) {
    const { userId, memberId } = await leagueMemberAuth(leagueHash);
    // If the user is not authenticated, throw an error
    if (!userId) {
      throw new Error('User not authenticated');
    }
    // If the user is already a member of the league return undefined
    if (memberId) {
      return undefined;
    }

    const members = {
      list: await db
        .select({ color: leagueMembersSchema.color })
        .from(leagueMembersSchema)
        .innerJoin(leaguesSchema, eq(leaguesSchema.leagueId, leagueMembersSchema.leagueId))
        .where(eq(leaguesSchema.leagueHash, leagueHash))
    };

    return { members } as unknown as ReturnType<typeof QUERIES.getLeague>;
  },

  /**
    * Get the draft state and information for the league
    * @param leagueHash - the hash of the league
    * @returns the draft state and information
    * @throws an error if the user is not a member of the league
    */
  getDraft: async function(leagueHash: LeagueHash) {
    const { memberId } = await leagueMemberAuth(leagueHash);
    // If the user is not a member of the league, throw an error
    if (!memberId) {
      throw new Error('User not a member of the league');
    }

    //leagueHash = 'OIK3njSpCQmEjzu6';

    const predictionsPromise = db
      .select({
        eventName: leagueEventsRulesSchema.eventName,
        timing: leagueEventsRulesSchema.timing,
        points: leagueEventsRulesSchema.points,
        description: leagueEventsRulesSchema.description,
      })
      .from(leagueEventsRulesSchema)
      .innerJoin(leaguesSchema, eq(leaguesSchema.leagueId, leagueEventsRulesSchema.leagueId))
      .where(and(
        eq(leaguesSchema.leagueHash, leagueHash),
        eq(leagueEventsRulesSchema.type, 'Prediction')))
      .then((predictions) => predictions.filter((prediction) => prediction.timing.includes('Draft')));

    const tribeUpdateEventSchema = aliasedTable(baseEventReferenceSchema, 'tribeUpdate');

    const castawaysPromise = db
      .select({
        castawayId: castawaysSchema.castawayId,
        fullName: castawaysSchema.fullName,
        age: castawaysSchema.age,
        residence: castawaysSchema.residence,
        occupation: castawaysSchema.occupation,
        imageUrl: castawaysSchema.imageUrl,
        tribe: {
          tribeName: tribesSchema.tribeName,
          tribeColor: tribesSchema.color,
        },
        pickedBy: leagueMembersSchema.displayName,
      })
      .from(castawaysSchema)
      .innerJoin(seasonsSchema, eq(seasonsSchema.seasonId, castawaysSchema.seasonId))
      .innerJoin(leaguesSchema, and(
        eq(leaguesSchema.leagueSeason, seasonsSchema.seasonId),
        eq(leaguesSchema.leagueHash, leagueHash)))
      // Joining tribe assignments
      .innerJoin(baseEventReferenceSchema, and(
        eq(baseEventReferenceSchema.referenceId, castawaysSchema.castawayId),
        eq(baseEventReferenceSchema.referenceType, 'Castaway')))
      .innerJoin(baseEventsSchema, and(
        eq(baseEventsSchema.baseEventId, baseEventReferenceSchema.baseEventId),
        eq(baseEventsSchema.eventName, 'tribeUpdate'),
        arrayContained(baseEventsSchema.keywords, ['Initial Tribes'])))
      .innerJoin(tribeUpdateEventSchema, and(
        eq(tribeUpdateEventSchema.baseEventId, baseEventsSchema.baseEventId),
        eq(tribeUpdateEventSchema.referenceType, 'Tribe')))
      .innerJoin(tribesSchema, eq(tribesSchema.tribeId, tribeUpdateEventSchema.referenceId))
      // Joining draft picks if they exist
      .leftJoin(selectionUpdatesSchema, and(
        eq(selectionUpdatesSchema.castawayId, castawaysSchema.castawayId),
        eq(selectionUpdatesSchema.draft, true)))
      .leftJoin(leagueMembersSchema, eq(leagueMembersSchema.memberId, selectionUpdatesSchema.memberId));

    const picksPromise = db
      .select({
        memberId: leagueMembersSchema.memberId,
        displayName: leagueMembersSchema.displayName,
        draftPick: castawaysSchema.fullName,
      })
      .from(leagueMembersSchema)
      .innerJoin(leaguesSchema, and(
        eq(leaguesSchema.leagueId, leagueMembersSchema.leagueId),
        eq(leaguesSchema.leagueHash, leagueHash)
      ))
      .leftJoin(selectionUpdatesSchema, and(
        eq(selectionUpdatesSchema.memberId, leagueMembersSchema.memberId),
        eq(selectionUpdatesSchema.draft, true)))
      .leftJoin(castawaysSchema, eq(castawaysSchema.castawayId, selectionUpdatesSchema.castawayId));

    const draftOrderPromise = db
      .select({
        draftOrder: leagueSettingsSchema.draftOrder,
      })
      .from(leagueSettingsSchema)
      .innerJoin(leaguesSchema, and(
        eq(leaguesSchema.leagueId, leagueSettingsSchema.leagueId),
        eq(leaguesSchema.leagueHash, leagueHash)))
      .then((settings) => settings[0]!.draftOrder);

    const [predictions, picks, castaways, draftOrder] = await Promise.all([
      predictionsPromise, picksPromise, castawaysPromise, draftOrderPromise]);

    const typedCastaways: CastawayDraftInfo[] = castaways;

    const draftPicks = draftOrder.map((memberId) =>
      picks.find((pick) => pick.memberId === memberId));

    return {
      predictions,
      castaways: typedCastaways,
      picks: draftPicks,
    };
  }
};
