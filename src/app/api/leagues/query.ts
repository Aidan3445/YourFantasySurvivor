import 'server-only';

import { aliasedTable, and, arrayContained, arrayOverlaps, asc, desc, eq, inArray, or } from 'drizzle-orm';
import { db } from '~/server/db';
import { leagueSettingsSchema, leaguesSchema } from '~/server/db/schema/leagues';
import { leagueMembersSchema, selectionUpdatesSchema } from '~/server/db/schema/leagueMembers';
import { seasonsSchema } from '~/server/db/schema/seasons';
import { auth, leagueMemberAuth } from '~/lib/auth';
import { baseEventReferenceSchema, baseEventRulesSchema, baseEventsSchema } from '~/server/db/schema/baseEvents';
import { leagueEventPredictionsSchema, leagueEventsRulesSchema, leagueEventsSchema } from '~/server/db/schema/leagueEvents';
import { episodesSchema } from '~/server/db/schema/episodes';
import { castawaysSchema } from '~/server/db/schema/castaways';
import type { LeagueStatus, LeagueHash, LeagueName } from '~/server/db/defs/leagues';
import type { SeasonName } from '~/server/db/defs/seasons';
import type { CastawayDraftInfo, CastawayName } from '~/server/db/defs/castaways';
import { tribesSchema } from '~/server/db/schema/tribes';
import type { LeagueMemberDisplayName, LeagueMemberColor } from '~/server/db/defs/leagueMembers';
import {
  type LeagueEventPrediction, type LeagueDirectEvent, type ReferenceType, type LeaguePredictionEvent,
  type BaseEventRule, type LeagueEventId, type LeagueEventName,
  LeaguePredictionTimingOptions,
  defaultBaseRules,
  type LeagueEventTiming
} from '~/server/db/defs/events';
import { QUERIES as SEASON_QUERIES } from '~/app/api/seasons/query';
import type { Tribe, TribeName } from '~/server/db/defs/tribes';
import type { EpisodeAirStatus, EpisodeNumber } from '~/server/db/defs/episodes';
import { compileScores } from './[leagueHash]/scores';

export const QUERIES = {
  /**
    * Get the league name
    * @param leagueHash - the hash of the league
    * @returns the league name
    */
  getLeagueName: async function(leagueHash: LeagueHash) {
    return await db
      .select({ leagueName: leaguesSchema.leagueName })
      .from(leaguesSchema)
      .where(eq(leaguesSchema.leagueHash, leagueHash))
      .then((leagues) => leagues[0]?.leagueName);
  },

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
      .leftJoin(baseEventRulesSchema, eq(baseEventRulesSchema.leagueId, leaguesSchema.leagueId))
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
        leagueEventRuleId: leagueEventsRulesSchema.leagueEventRuleId,
        eventName: leagueEventsRulesSchema.eventName,
        description: leagueEventsRulesSchema.description,
        points: leagueEventsRulesSchema.points,
        eventType: leagueEventsRulesSchema.eventType,
        referenceTypes: leagueEventsRulesSchema.referenceTypes,
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
        out: baseEventsSchema.eventName,
        memberId: leagueMembersSchema.displayName,
      })
      .from(leagueMembersSchema)
      .innerJoin(leaguesSchema, eq(leaguesSchema.leagueId, leagueMembersSchema.leagueId))
      .innerJoin(seasonsSchema, eq(seasonsSchema.seasonId, leaguesSchema.leagueSeason))
      .leftJoin(castawaysSchema, eq(castawaysSchema.castawayId,
        db.select({ castawayId: selectionUpdatesSchema.castawayId })
          .from(selectionUpdatesSchema)
          .where(eq(selectionUpdatesSchema.memberId, leagueMembersSchema.memberId))
          .orderBy(desc(selectionUpdatesSchema.episodeId))
          .limit(1)))
      .leftJoin(baseEventsSchema, and(
        inArray(baseEventsSchema.eventName, ['elim', 'noVoteExit']),
        inArray(baseEventsSchema.baseEventId,
          db.select({ baseEventId: baseEventReferenceSchema.baseEventId })
            .from(baseEventReferenceSchema)
            .where(and(
              eq(baseEventReferenceSchema.referenceId, castawaysSchema.castawayId),
              eq(baseEventReferenceSchema.referenceType, 'Castaway'))))))
      .where(eq(leagueMembersSchema.userId, userId))
      .orderBy(desc(seasonsSchema.premiereDate))
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
        leagueStatus: LeagueStatus,
        season: SeasonName,
        castaway: CastawayName | null,
        out?: string | null,
      }[]));

    return leagues;
  },

  /**
    * Get the league colors only for joining the league
    * @param leagueHash - the hash of the league
    * @returns the league member selected colors
    * @throws an error if the user is not authenticated
    */
  getLeagueJoin: async function(leagueHash: string) {
    const { userId } = await leagueMemberAuth(leagueHash);
    // If the user is not authenticated, throw an error
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const memberColors: LeagueMemberColor[] = await db
      .select({ color: leagueMembersSchema.color })
      .from(leagueMembersSchema)
      .innerJoin(leaguesSchema, eq(leaguesSchema.leagueId, leagueMembersSchema.leagueId))
      .where(eq(leaguesSchema.leagueHash, leagueHash))
      .then((members) => members.map((member) => member.color));

    return memberColors;
  },

  /**
    * Get the draft state and information for the league
    * @param leagueHash - the hash of the league
    * @returns the draft state and information
    * @throws an error if the user is not a member of the league
    */
  getDraft: async function(leagueHash: LeagueHash) {
    const { memberId, league } = await leagueMemberAuth(leagueHash);
    // If the user is not a member of the league, throw an error
    if (!memberId || !league) {
      throw new Error('User not a member of the league');
    }

    const predictionsPromise = db
      .select({
        leagueEventRuleId: leagueEventsRulesSchema.leagueEventRuleId,
        eventName: leagueEventsRulesSchema.eventName,
        description: leagueEventsRulesSchema.description,
        points: leagueEventsRulesSchema.points,
        referenceTypes: leagueEventsRulesSchema.referenceTypes,
        predictionMade: {
          referenceType: leagueEventPredictionsSchema.referenceType,
          referenceId: leagueEventPredictionsSchema.referenceId,
        }
      })
      .from(leagueEventsRulesSchema)
      .innerJoin(leaguesSchema, eq(leaguesSchema.leagueId, leagueEventsRulesSchema.leagueId))
      .leftJoin(leagueEventPredictionsSchema, and(
        eq(leagueEventPredictionsSchema.leagueEventRuleId, leagueEventsRulesSchema.leagueEventRuleId),
        eq(leagueEventPredictionsSchema.memberId, memberId)))
      .where(and(
        eq(leaguesSchema.leagueHash, leagueHash),
        eq(leagueEventsRulesSchema.eventType, 'Prediction'),
        arrayOverlaps(leagueEventsRulesSchema.timing, ['Draft', 'Weekly', 'Weekly (Premerge only)'])))
      .orderBy(asc(leagueEventsRulesSchema.timing))
      .then((predictions) => predictions.map((prediction) => {
        const draftPrediction: LeagueEventPrediction = {
          ...prediction,
          timing: ['Draft'],
          eventType: 'Prediction',
          public: false
        };
        return draftPrediction;
      }));

    const tribeUpdateEventSchema = aliasedTable(baseEventReferenceSchema, 'tribeUpdate');
    const eliminationEventReferenceSchema = aliasedTable(baseEventReferenceSchema, 'elimination_ref');
    const eliminationEventSchema = aliasedTable(baseEventsSchema, 'elimination');

    const castawaysPromise = db
      .select({
        castawayId: castawaysSchema.castawayId,
        fullName: castawaysSchema.fullName,
        age: castawaysSchema.age,
        residence: castawaysSchema.residence,
        occupation: castawaysSchema.occupation,
        imageUrl: castawaysSchema.imageUrl,
        tribe: {
          tribeId: tribesSchema.tribeId,
          tribeName: tribesSchema.tribeName,
          tribeColor: tribesSchema.tribeColor,
          seasonName: seasonsSchema.seasonName,
        },
        pickedBy: leagueMembersSchema.displayName,
        eliminatedEpisode: eliminationEventSchema.episodeId,
      })
      .from(castawaysSchema)
      .innerJoin(seasonsSchema, eq(seasonsSchema.seasonId, castawaysSchema.seasonId))
      .innerJoin(leaguesSchema, and(
        eq(leaguesSchema.leagueSeason, seasonsSchema.seasonId),
        eq(leaguesSchema.leagueHash, leagueHash)))
      .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId))
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
      // Joining elimination if it exists
      .leftJoin(eliminationEventSchema, and(
        inArray(eliminationEventSchema.eventName, ['elim', 'noVoteExit']),
        inArray(eliminationEventSchema.baseEventId,
          db.select({ baseEventId: eliminationEventReferenceSchema.baseEventId })
            .from(eliminationEventReferenceSchema)
            .where(and(
              eq(eliminationEventReferenceSchema.referenceId, castawaysSchema.castawayId),
              eq(eliminationEventReferenceSchema.referenceType, 'Castaway')))
        )))
      // Joining draft picks if they exist
      .leftJoin(selectionUpdatesSchema, and(
        eq(selectionUpdatesSchema.castawayId, castawaysSchema.castawayId),
        eq(selectionUpdatesSchema.draft, true),
        inArray(selectionUpdatesSchema.memberId, db.select({ memberId: leagueMembersSchema.memberId })
          .from(leagueMembersSchema)
          .innerJoin(leaguesSchema, eq(leaguesSchema.leagueId, leagueMembersSchema.leagueId))
          .where(eq(leaguesSchema.leagueHash, leagueHash)))))
      .leftJoin(leagueMembersSchema, eq(leagueMembersSchema.memberId, selectionUpdatesSchema.memberId));

    const picksPromise = db
      .select({
        memberId: leagueMembersSchema.memberId,
        displayName: leagueMembersSchema.displayName,
        color: leagueMembersSchema.color,
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
    typedCastaways.sort((a, b) => a.tribe.tribeName.localeCompare(b.tribe.tribeName));

    const draftPicks = draftOrder.map((memberId) =>
      picks.find((pick) => pick.memberId === memberId))
      // Filter is kind of unnecessary but it's here to make TS happy
      // and to ensure that the draft order didn't have any erroneous member ids
      .filter((pick) => !!pick);

    return {
      predictions,
      castaways: typedCastaways,
      tribes: Array.from(new Set(typedCastaways.map((castaway) => castaway.tribe))),
      picks: draftPicks,
    };
  },

  /**
    * Get the next episode to air for the league's season
    * @param leagueHash - the hash of the league
    * @param count - the number of episodes to get, default 1
    * @returns the episodes starting from the next episode to air 
    * sorted by air date in descending order
    * @throws an error if the season does not exist
    */
  getEpisodes: async function(leagueHash: LeagueHash, count = 1) {
    const { memberId, league } = await leagueMemberAuth(leagueHash);
    // If the user is not a member of the league, throw an error
    if (!memberId || !league) {
      throw new Error('User not a member of the league');
    }

    return await db
      .select({
        episodeId: episodesSchema.episodeId,
        episodeNumber: episodesSchema.episodeNumber,
        episodeTitle: episodesSchema.title,
        episodeAirDate: episodesSchema.airDate,
        episodeRuntime: episodesSchema.runtime,
        isMerge: episodesSchema.isMerge,
        isFinale: episodesSchema.isFinale,
      })
      .from(episodesSchema)
      .innerJoin(seasonsSchema, and(
        eq(seasonsSchema.seasonId, episodesSchema.seasonId),
        eq(seasonsSchema.seasonId, league.leagueSeason)))
      .orderBy(asc(episodesSchema.airDate))
      .then((res) => {
        return res.slice(0, count)
          .map((episode) => {
            const airDate = new Date(`${episode.episodeAirDate} Z`);
            const airStatus: EpisodeAirStatus = airDate > new Date() ? 'Upcoming' :
              airDate.getTime() + episode.episodeRuntime * 60 * 1000 > new Date().getTime() ?
                'Airing' : 'Aired';

            return {
              episodeId: episode.episodeId,
              episodeNumber: episode.episodeNumber,
              episodeTitle: episode.episodeTitle,
              episodeAirDate: new Date(`${episode.episodeAirDate} Z`),
              airStatus: airStatus,
              isMerge: episode.isMerge,
              isFinale: episode.isFinale,
            };
          });
      });
  },

  /**
   * Get the league events for a league
   * @param leagueHash - the hash of the league
   * @returns the league events for the league as a map of episode number to events
   * split into direct and prediction events
   * @throws an error if the user is not a member of the league
   */
  getLeagueEvents: async function(leagueHash: LeagueHash) {
    const { memberId, league } = await leagueMemberAuth(leagueHash);
    // If the user is not a member of the league, throw an error
    if (!memberId || !league) {
      throw new Error('User not a member of the league');
    }


    const directEventsPromise = db
      .select({
        leagueEventRuleId: leagueEventsRulesSchema.leagueEventRuleId,
        episodeNumber: episodesSchema.episodeNumber,
        eventId: leagueEventsSchema.leagueEventId,
        eventName: leagueEventsRulesSchema.eventName,
        points: leagueEventsRulesSchema.points,
        referenceType: leagueEventsSchema.referenceType,
        referenceId: leagueEventsSchema.referenceId,
        castaway: castawaysSchema.fullName,
        tribe: tribesSchema.tribeName,
        notes: leagueEventsSchema.notes,
      })
      .from(leagueEventsSchema)
      .innerJoin(leagueEventsRulesSchema, and(
        eq(leagueEventsRulesSchema.leagueEventRuleId, leagueEventsSchema.leagueEventRuleId),
        eq(leagueEventsRulesSchema.leagueId, league.leagueId),
        eq(leagueEventsRulesSchema.eventType, 'Direct')))
      .innerJoin(episodesSchema, eq(episodesSchema.episodeId, leagueEventsSchema.episodeId))
      // references
      .leftJoin(castawaysSchema, and(
        eq(castawaysSchema.castawayId, leagueEventsSchema.referenceId),
        eq(leagueEventsSchema.referenceType, 'Castaway')))
      .leftJoin(tribesSchema, and(
        eq(tribesSchema.tribeId, leagueEventsSchema.referenceId),
        eq(leagueEventsSchema.referenceType, 'Tribe')))
      .then((events) => events.reduce((acc, event) => {
        acc[event.episodeNumber] ??= {
          Castaway: [],
          Tribe: [],
        };

        const newEvent = {
          leagueEventRuleId: event.leagueEventRuleId,
          eventId: event.eventId,
          eventName: event.eventName,
          points: event.points,
          referenceId: event.referenceId,
          referenceType: event.referenceType,
          notes: event.notes,
        };

        switch (event.referenceType) {
          case 'Castaway':
            acc[event.episodeNumber]!.Castaway.push({ ...newEvent, referenceName: event.castaway! });
            break;
          case 'Tribe':
            acc[event.episodeNumber]!.Tribe.push({ ...newEvent, referenceName: event.tribe! });
            break;
        }

        return acc;
      }, {} as Record<EpisodeNumber, Record<ReferenceType, LeagueDirectEvent[]>>));


    const predictionEventsPromise = db
      .select({
        leagueEventRuleId: leagueEventsRulesSchema.leagueEventRuleId,
        eventId: leagueEventsSchema.leagueEventId,
        eventName: leagueEventsRulesSchema.eventName,
        points: leagueEventsRulesSchema.points,
        episodeNumber: episodesSchema.episodeNumber,
        predictionMaker: leagueMembersSchema.displayName,
        referenceType: leagueEventPredictionsSchema.referenceType,
        referenceId: leagueEventsSchema.referenceId,
        castaway: castawaysSchema.fullName,
        tribe: tribesSchema.tribeName,
        notes: leagueEventsSchema.notes,
      })
      .from(leagueEventsSchema)
      .innerJoin(leagueEventsRulesSchema, and(
        eq(leagueEventsRulesSchema.leagueEventRuleId, leagueEventsSchema.leagueEventRuleId),
        eq(leagueEventsRulesSchema.leagueId, league.leagueId),
        eq(leagueEventsRulesSchema.eventType, 'Prediction')))
      .innerJoin(episodesSchema, eq(episodesSchema.episodeId, leagueEventsSchema.episodeId))
      // prediction
      .innerJoin(leagueEventPredictionsSchema, and(
        eq(leagueEventPredictionsSchema.leagueEventRuleId, leagueEventsSchema.leagueEventRuleId),
        eq(leagueEventPredictionsSchema.referenceId, leagueEventsSchema.referenceId),
        or(
          // if the prediction episode matches the event for weekly predictions
          and(
            eq(leagueEventPredictionsSchema.episodeId, leagueEventsSchema.episodeId),
            arrayOverlaps(leagueEventsRulesSchema.timing, ['Weekly', 'Weekly (Premerge only)', 'Weekly (Postmerge only)'])),
          // if the event is not weekly, the episode doesn't matter
          // note manual predictions should not be possible but just in case
          arrayOverlaps(leagueEventsRulesSchema.timing, LeaguePredictionTimingOptions
            .filter(timing => !timing.includes('Weekly'))))))
      .innerJoin(leagueMembersSchema, eq(leagueMembersSchema.memberId, leagueEventPredictionsSchema.memberId))
      // references
      .leftJoin(castawaysSchema, and(
        eq(castawaysSchema.castawayId, leagueEventsSchema.referenceId),
        eq(leagueEventsSchema.referenceType, 'Castaway')))
      .leftJoin(tribesSchema, and(
        eq(tribesSchema.tribeId, leagueEventsSchema.referenceId),
        eq(leagueEventsSchema.referenceType, 'Tribe')))
      .then((events: {
        leagueEventRuleId: LeagueEventId,
        eventId: LeagueEventId,
        eventName: LeagueEventName
        points: number,
        episodeNumber: EpisodeNumber,
        predictionMaker: LeagueMemberDisplayName,
        referenceType: ReferenceType,
        referenceId: number,
        castaway: CastawayName | null,
        tribe: TribeName | null,
        notes: string[] | null
      }[]

      ) => events.reduce((acc, event) => {
        acc[event.episodeNumber] ??= [];
        const newEvent = {
          leagueEventRuleId: event.leagueEventRuleId,
          eventId: event.eventId,
          eventName: event.eventName,
          points: event.points,
          referenceType: event.referenceType,
          referenceId: event.referenceId,
          predictionMaker: event.predictionMaker,
          notes: event.notes,
        };

        switch (event.referenceType) {
          case 'Castaway':
            acc[event.episodeNumber]!.push({ ...newEvent, referenceName: event.castaway! });
            break;
          case 'Tribe':
            acc[event.episodeNumber]!.push({ ...newEvent, referenceName: event.tribe! });
            break;
        }

        return acc;
      }, {} as Record<EpisodeNumber, LeaguePredictionEvent[]>));


    const [directEvents, predictionEvents] = await Promise.all([
      directEventsPromise, predictionEventsPromise
    ]);

    return { directEvents, predictionEvents };
  },

  /**
    * Get the selection timeline for a league
    * @param leagueHash - the hash of the league
    * @returns castawayMembers and memberCastaways
    * - castawayMembers holds an array of which members selected each castaway each episode
    * - memberCastaways holds an array of castaways selected by each member each episode
    * @throws an error if the user is not a member of the league
    */
  getSelectionTimeline: async function(leagueHash: LeagueHash) {
    const selectionUpdates = await db
      .select({
        episodeNumber: episodesSchema.episodeNumber,
        leagueMember: leagueMembersSchema.displayName,
        color: leagueMembersSchema.color,
        castaway: castawaysSchema.fullName,
        draft: selectionUpdatesSchema.draft,
      })
      .from(selectionUpdatesSchema)
      .innerJoin(leagueMembersSchema, eq(leagueMembersSchema.memberId, selectionUpdatesSchema.memberId))
      .innerJoin(castawaysSchema, eq(castawaysSchema.castawayId, selectionUpdatesSchema.castawayId))
      .innerJoin(episodesSchema, eq(episodesSchema.episodeId, selectionUpdatesSchema.episodeId))
      .innerJoin(leaguesSchema, and(
        eq(leaguesSchema.leagueId, leagueMembersSchema.leagueId),
        eq(leaguesSchema.leagueHash, leagueHash)))
      .orderBy(asc(episodesSchema.episodeNumber));

    /** memberCastaways holds an array of castaways selected by each member each episode */
    const memberCastaways = selectionUpdates.reduce((acc, row) => {
      acc[row.leagueMember] ??= [];
      const latestUpdateEpisode = acc[row.leagueMember]!.length;
      // get previous selection if it exists
      const previousSelection = acc[row.leagueMember]![latestUpdateEpisode - 1];
      if (previousSelection !== undefined) {
        // fill in the episodes between
        acc[row.leagueMember]!.push(...Array(row.episodeNumber - latestUpdateEpisode)
          .fill(previousSelection) as (CastawayName | null)[]);
      }
      // add the new selection
      acc[row.leagueMember]!.push(row.castaway);
      // if this is the draft selection, fill in the episodes before with null
      if (row.draft) {
        acc[row.leagueMember]!.unshift(...Array(row.episodeNumber - latestUpdateEpisode)
          .fill(null) as null[]);
      }
      return acc;
    }, {} as Record<LeagueMemberDisplayName, (CastawayName | null)[]>);

    /* castawayMembers holds an array of which members selected each castaway each episode */
    const castawayMembers = selectionUpdates.reduce((acc, row) => {
      acc[row.castaway] ??= [];
      const latestUpdateEpisode = acc[row.castaway]!.length - 1;
      // get previous selection if it exists or null if this is the first time 
      // a member picked up this castaway
      const previousSelector = acc[row.castaway]![latestUpdateEpisode] ?? null;
      // fill in the episodes between
      acc[row.castaway]!.push(...Array(Math.max(row.episodeNumber - latestUpdateEpisode - 1, 0))
        .fill(previousSelector) as (LeagueMemberDisplayName | null)[]);
      // add the new selection
      acc[row.castaway]![row.episodeNumber] = row.leagueMember;

      // castaways, unlike members, can be dropped by players
      const previousSelection = memberCastaways[row.leagueMember]![row.episodeNumber - 1];
      if (previousSelection && previousSelection !== row.castaway) {
        // fill in the episodes between
        acc[previousSelection]!.push(...Array(Math.max(row.episodeNumber - acc[previousSelection]!.length, 0))
          .fill(row.leagueMember) as (LeagueMemberDisplayName | null)[]);
        // insert the null to indicate the castaway was dropped
        acc[previousSelection]!.push(null);
      }

      return acc;
    }, {} as Record<CastawayName, (LeagueMemberDisplayName | null)[]>);

    return { memberCastaways, castawayMembers };
  },

  /**
    * Get the current score, event, and selection timeline for a league
    * @param leagueHash - the hash of the league
    * @returns the scores, selection timeline, and league
    * @throws an error if the user is not a member of the league
    */
  getLeagueLiveData: async function(leagueHash: LeagueHash) {
    const { memberId, league } = await leagueMemberAuth(leagueHash);
    // If the user is not a member of the league, throw an error
    if (!memberId || !league) {
      throw new Error('User not a member of the league');
    }

    const baseEventRulesPromise = db
      .select()
      .from(baseEventRulesSchema)
      .where(eq(baseEventRulesSchema.leagueId, league.leagueId))
      .limit(1)
      .then((rules) => rules[0]);

    const leagueSettingsPromise = db
      .select()
      .from(leagueSettingsSchema)
      .where(eq(leagueSettingsSchema.leagueId, league.leagueId))
      .limit(1)
      .then((settings) => settings[0]);

    const [
      baseEvents, tribesTimeline, elims, castaways,
      leagueEvents, baseEventRules,
      selectionTimeline, leagueSettings, episodes
    ] = await Promise.all([
      SEASON_QUERIES.getBaseEvents(league.leagueSeason),
      SEASON_QUERIES.getTribesTimeline(league.leagueSeason),
      SEASON_QUERIES.getEliminations(league.leagueSeason),
      SEASON_QUERIES.getCastaways(league.leagueSeason),

      QUERIES.getLeagueEvents(leagueHash),
      baseEventRulesPromise,
      QUERIES.getSelectionTimeline(leagueHash),
      leagueSettingsPromise,

      QUERIES.getEpisodes(leagueHash, 100), // move to seasons
    ]);

    if (!leagueSettings) {
      throw new Error('League not found');
    }

    const { scores, currentStreaks } = compileScores(
      baseEvents, tribesTimeline, elims, leagueEvents, baseEventRules ?? defaultBaseRules,
      selectionTimeline, leagueSettings.survivalCap, leagueSettings.preserveStreak);

    return {
      scores,
      currentStreaks,
      baseEvents,
      castaways,
      leagueEvents,
      selectionTimeline,
      episodes,
      baseEventRules: baseEventRules as BaseEventRule,
    };
  },
};

/**
  * Get this weeks predictions for a league, episode, and member
  * @param leagueHash - the hash of the league
  * @returns the predictions for the league for this week
  * @throws an error if the user is not a member of the league
  */
export async function getThisWeeksPredictions(leagueHash: LeagueHash) {
  const { memberId, league, seasonName } = await leagueMemberAuth(leagueHash);
  // If the user is not a member of the league, throw an error
  if (!memberId || !league) {
    throw new Error('User not a member of the league');
  }

  if (league.leagueStatus === 'Inactive') return;

  const episodes = await QUERIES.getEpisodes(leagueHash, 100);
  if (!episodes || episodes.length === 0) return;
  if (episodes.some((episode) => episode.airStatus === 'Airing')) return;
  const nextEpisode = episodes.find((episode) => episode.airStatus === 'Upcoming');
  if (!nextEpisode) return;

  const lastEpisode = episodes[nextEpisode.episodeNumber - 2];
  const mergeEpisode = episodes.find((episode) => episode.isMerge);

  const predictionsFilter = (ruleTiming: LeagueEventTiming[]) => {
    // Draft takes precedence if included in the list: 
    // - if the league is in draft status
    // - if there are no previous episodes
    // - if the draft date is after the last aired episode
    if (ruleTiming.includes('Draft') && (league.leagueStatus === 'Draft' || !lastEpisode ||
      league.draftDate > lastEpisode.episodeAirDate)) return true;
    // Weekly takes precedence if included in the list and draft checks fail
    else if (ruleTiming.includes('Weekly')) return true;
    // Likewise for weekly premerge and postmerge
    // Weekly premerge only if included in the list and no merge episode
    else if (ruleTiming.includes('Weekly (Premerge only)') &&
      !mergeEpisode) return true;
    // Weekly postmerge only if included in the list and merge episode exists
    else if (ruleTiming.includes('Weekly (Postmerge only)') &&
      !!mergeEpisode) return true;
    // After merge only if included in the list and merge episode is last aired
    else if (ruleTiming.includes('After Merge') &&
      !!lastEpisode?.isMerge) return true;
    // Before finale only if included in the list and next episode is the finale
    else if (ruleTiming.includes('Before Finale') &&
      !!nextEpisode?.isFinale) return true;
  };

  const predictionsPromise = db
    .select({
      leagueEventRuleId: leagueEventsRulesSchema.leagueEventRuleId,
      eventName: leagueEventsRulesSchema.eventName,
      description: leagueEventsRulesSchema.description,
      points: leagueEventsRulesSchema.points,
      referenceTypes: leagueEventsRulesSchema.referenceTypes,
      timing: leagueEventsRulesSchema.timing,
      predictionMade: {
        referenceType: leagueEventPredictionsSchema.referenceType,
        referenceId: leagueEventPredictionsSchema.referenceId,
      },
      public: leagueEventsRulesSchema.public
    })
    .from(leagueEventsRulesSchema)
    .innerJoin(leaguesSchema, and(
      eq(leaguesSchema.leagueId, leagueEventsRulesSchema.leagueId),
      eq(leaguesSchema.leagueHash, leagueHash)))
    .leftJoin(leagueEventPredictionsSchema, and(
      eq(leagueEventPredictionsSchema.leagueEventRuleId, leagueEventsRulesSchema.leagueEventRuleId),
      eq(leagueEventPredictionsSchema.memberId, memberId),
      eq(leagueEventPredictionsSchema.episodeId, nextEpisode.episodeId)))
    .where(eq(leagueEventsRulesSchema.eventType, 'Prediction'))
    .then((predictions) => predictions
      .filter((prediction) => predictionsFilter(prediction.timing))
      .map((prediction) => {
        const draftPrediction: LeagueEventPrediction = {
          ...prediction,
          eventType: 'Prediction',
        };
        return draftPrediction;
      }));

  const [predictions, castaways] = await Promise.all([
    predictionsPromise,
    SEASON_QUERIES.getCastaways(league.leagueSeason),
  ]);

  const remainingCastaways = castaways.filter((castaway) =>
    !castaway.eliminatedEpisode || castaway.eliminatedEpisode > nextEpisode.episodeNumber);

  const tribes: Tribe[] = Array.from(new Set(remainingCastaways.map((castaway) => {
    const tribe = castaway.tribes
      .findLast((tribe) => tribe.episode <= nextEpisode.episodeNumber);
    if (!tribe) return;
    return { ...tribe, seasonName: seasonName! };
  })))
    .filter((tribe) => tribe !== undefined);

  return { predictions, castaways: remainingCastaways, tribes, nextEpisode };
}
