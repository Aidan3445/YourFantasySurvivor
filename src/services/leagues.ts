import 'server-only';

import { aliasedTable, and, arrayContained, arrayOverlaps, asc, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { db } from '~/server/db';
import { leagueSettingsSchema, leaguesSchema } from '~/server/db/schema/leagues';
import { leagueMembersSchema, selectionUpdatesSchema } from '~/server/db/schema/leagueMembers';
import { seasonsSchema } from '~/server/db/schema/seasons';
import { auth, leagueMemberAuth } from '~/lib/auth';
import { baseEventPredictionRulesSchema, baseEventPredictionsSchema, baseEventReferenceSchema, baseEventRulesSchema, baseEventsSchema, shauhinModeSettingsSchema } from '~/server/db/schema/baseEvents';
import { leagueEventPredictionsSchema, leagueEventsRulesSchema, leagueEventsSchema } from '~/server/db/schema/leagueEvents';
import { episodesSchema } from '~/server/db/schema/episodes';
import { castawaysSchema } from '~/server/db/schema/castaways';
import type { LeagueStatus, LeagueHash, LeagueName } from '~/types/leagues';
import type { SeasonName } from '~/types/seasons';
import type { CastawayDraftInfo, CastawayName } from '~/types/castaways';
import { tribesSchema } from '~/server/db/schema/tribes';
import type { LeagueMemberDisplayName, LeagueMemberColor } from '~/types/leagueMembers';
import {
  type EventPrediction, type LeagueDirectEvent, type ReferenceType, type LeaguePredictionEvent,
  type BaseEventRule, type LeagueEventId, type LeagueEventName,
  PredictionTimingOptions,
  defaultBaseRules,
  type PredictionEventTiming,
  type Prediction,
  defaultPredictionRules,
  ScoringBaseEventNames,
  type LeaguePredictionDraft,
  type ScoringBaseEventName,
} from '~/types/events';
import { QUERIES as SEASON_QUERIES } from '~/app/api/seasons/query';
import type { Tribe, TribeName } from '~/types/tribes';
import type { EpisodeAirStatus, EpisodeNumber } from '~/types/episodes';
import { compileScores } from '~/app/api/leagues/[leagueHash]/scores';
import { QUERIES as SYS_QUERIES } from '~/app/api/sys/query';
import { leagueChatSchema } from '~/server/db/schema/leagueChat';
import { type Message } from 'node_modules/@ably/chat/dist/core/message';
import { basePredictionRulesSchemaToObject } from '~/lib/utils';

export const leaguesService = {
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
        baseEventRules: baseEventRulesSchema,
        basePredictionRules: baseEventPredictionRulesSchema,
        shauhinModeSettings: shauhinModeSettingsSchema,
      })
      .from(leaguesSchema)
      .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId))
      .innerJoin(seasonsSchema, eq(seasonsSchema.seasonId, leaguesSchema.leagueSeason))
      .leftJoin(baseEventRulesSchema, eq(baseEventRulesSchema.leagueId, leaguesSchema.leagueId))
      .leftJoin(baseEventPredictionRulesSchema, eq(baseEventPredictionRulesSchema.leagueId, leaguesSchema.leagueId))
      .leftJoin(shauhinModeSettingsSchema, eq(shauhinModeSettingsSchema.leagueId, leaguesSchema.leagueId))
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
      basePredictionRules: basePredictionRulesSchemaToObject(league.basePredictionRules),
      settings: {
        ...league.settings,
        draftDate: league.settings.draftDate ? new Date(`${league.settings.draftDate} Z`) : null,
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
    * Get the league's settings and rules 
  * @param leagueHash - the hash of the league
  * @returns the league settings and rules
  * @throws an error if the user is not a member of the league
    */
  getLeagueConfig: async function(leagueHash: LeagueHash) {
    const { memberId, league } = await leagueMemberAuth(leagueHash);
    // If the user is not a member of the league, throw an error
    if (!memberId || !league) {
      throw new Error('User not a member of the league');
    }

    const { leagueSettings, baseEventRules, basePredictionRules } = await db
      .select({
        leagueSettings: leagueSettingsSchema,
        baseEventRules: baseEventRulesSchema,
        basePredictionRules: baseEventPredictionRulesSchema,
      })
      .from(leagueSettingsSchema)
      .fullJoin(baseEventRulesSchema, eq(baseEventRulesSchema.leagueId, leagueSettingsSchema.leagueId))
      .fullJoin(baseEventPredictionRulesSchema, eq(baseEventPredictionRulesSchema.leagueId, leagueSettingsSchema.leagueId))
      .where(eq(leagueSettingsSchema.leagueId, league.leagueId))
      .limit(1)
      .then((results) => results[0] ?? {
        baseEventRules: null,
        basePredictionRules: null,
        leagueSettings: null,
      });

    if (!leagueSettings) {
      throw new Error('League settings not found');
    }

    return {
      leagueSettings,
      baseEventRules,
      basePredictionRules: basePredictionRulesSchemaToObject(basePredictionRules)
    };
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
        const draftPrediction: LeaguePredictionDraft = {
          ...prediction,
          timing: ['Draft'],
          eventType: 'Prediction',
          // TODO: Handle custom prediction betting
          predictionMade: prediction.predictionMade ? {
            ...prediction.predictionMade,
            bet: null,
          } : null,
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
   * Get the base predictions for a league
   * @param leagueHash - the hash of the league
   * @returns the base predictions for the league
   * @throws an error if the user is not a member of the league
   */
  getBasePredictions: async function(leagueHash: LeagueHash) {
    const { memberId, league } = await leagueMemberAuth(leagueHash);
    // If the user is not a member of the league, throw an error
    if (!memberId || !league) {
      throw new Error('User not a member of the league');
    }

    const { basePredictionRules } = await this.getLeagueConfig(leagueHash);

    const basePredictions = await db
      .select({
        eventName: baseEventPredictionsSchema.baseEventName,
        eventId: baseEventsSchema.baseEventId,
        episodeNumber: episodesSchema.episodeNumber,
        predictionMaker: leagueMembersSchema.displayName,
        referenceType: baseEventPredictionsSchema.referenceType,
        referenceId: baseEventPredictionsSchema.referenceId,
        bet: baseEventPredictionsSchema.bet,
        resultReferenceType: baseEventReferenceSchema.referenceType,
        resultReferenceId: baseEventReferenceSchema.referenceId,
        castaway: castawaysSchema.fullName,
        tribe: tribesSchema.tribeName,
      })
      .from(baseEventPredictionsSchema)
      .innerJoin(episodesSchema, eq(episodesSchema.episodeId, baseEventPredictionsSchema.episodeId))
      .innerJoin(leagueMembersSchema, eq(leagueMembersSchema.memberId, baseEventPredictionsSchema.memberId))
      // result
      .leftJoin(baseEventsSchema, and(
        eq(
          sql`cast(${baseEventsSchema.eventName} as varchar)`,
          sql`cast(${baseEventPredictionsSchema.baseEventName} as varchar)`),
        eq(baseEventsSchema.episodeId, episodesSchema.episodeId)))
      .leftJoin(baseEventReferenceSchema, eq(baseEventReferenceSchema.baseEventId, baseEventsSchema.baseEventId))
      // references
      .leftJoin(castawaysSchema, and(
        eq(castawaysSchema.castawayId, baseEventPredictionsSchema.referenceId),
        eq(baseEventPredictionsSchema.referenceType, 'Castaway')))
      .leftJoin(tribesSchema, and(
        eq(tribesSchema.tribeId, baseEventPredictionsSchema.referenceId),
        eq(baseEventPredictionsSchema.referenceType, 'Tribe')))
      .where(eq(leagueMembersSchema.leagueId, league.leagueId))
      .then((rows) => rows.reduce((acc, row) => {
        acc[row.episodeNumber] ??= [];
        const newEvent = {
          eventName: row.eventName,
          eventId: row.eventId,
          points: basePredictionRules[row.eventName]?.points ?? 0,
          predictionMaker: row.predictionMaker,
          referenceType: row.referenceType,
          referenceId: row.referenceId,
          bet: row.bet ?? undefined,
          hit: row.resultReferenceId === null
            ? null
            : row.resultReferenceId === row.referenceId
            && row.resultReferenceType === row.referenceType
        };

        // Check if there's double prediction
        // if there is only keep the hit or the first miss
        const doubleIndex = acc[row.episodeNumber]!.findIndex((event) =>
          event.eventName === newEvent.eventName &&
          event.referenceType === newEvent.referenceType &&
          event.predictionMaker === newEvent.predictionMaker);
        if (doubleIndex !== -1) {
          if (acc[row.episodeNumber]![doubleIndex]!.hit ?? !newEvent.hit) return acc;
          // if the new event is a hit and the double is a miss, remove the double
          acc[row.episodeNumber]!.splice(doubleIndex, 1);
        }

        switch (row.referenceType) {
          case 'Castaway':
            acc[row.episodeNumber]!.push({
              ...newEvent,
              referenceName: row.castaway!,
            });
            break;
          case 'Tribe':
            acc[row.episodeNumber]!.push({
              ...newEvent,
              referenceName: row.tribe!,
            });
            break;
        }

        return acc;
      }, {} as Record<EpisodeNumber, EventPrediction[]>));

    return basePredictions;
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


    const predictionsPromise = db
      .select({
        leagueEventRuleId: leagueEventsRulesSchema.leagueEventRuleId,
        eventId: leagueEventsSchema.leagueEventId,
        eventName: leagueEventsRulesSchema.eventName,
        points: leagueEventsRulesSchema.points,
        episodeNumber: episodesSchema.episodeNumber,
        predictionMaker: leagueMembersSchema.displayName,
        referenceType: leagueEventPredictionsSchema.referenceType,
        referenceId: leagueEventPredictionsSchema.referenceId,
        resultReferenceType: leagueEventsSchema.referenceType,
        resultReferenceId: leagueEventsSchema.referenceId,
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
        or(
          // if the prediction episode matches the event for weekly predictions
          and(
            eq(leagueEventPredictionsSchema.episodeId, leagueEventsSchema.episodeId),
            arrayOverlaps(leagueEventsRulesSchema.timing, ['Weekly', 'Weekly (Premerge only)', 'Weekly (Postmerge only)'])),
          // if the event is not weekly, the episode doesn't matter
          // note manual predictions should not be possible but just in case
          arrayOverlaps(leagueEventsRulesSchema.timing, PredictionTimingOptions
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
        resultReferenceType: ReferenceType,
        resultReferenceId: number,
        castaway: CastawayName | null,
        tribe: TribeName | null,
        notes: string[] | null
      }[]) => events.reduce((acc, event) => {
        acc[event.episodeNumber] ??= [];
        const newEvent = {
          leagueEventRuleId: event.leagueEventRuleId,
          eventId: event.eventId,
          eventName: event.eventName,
          points: event.points,
          referenceType: event.resultReferenceType,
          referenceId: event.referenceId,
          hit: event.resultReferenceId === event.referenceId &&
            event.resultReferenceType === event.referenceType,
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
      directEventsPromise, predictionsPromise
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

      // if the selection went back to the previous pick, ignore it
      if (previousSelection === row.castaway) {
        return acc;
      }

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

      // if the selector went back to the previous pick, ignore it
      if (previousSelector === row.leagueMember) {
        return acc;
      }

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

    const [
      baseEvents, tribesTimeline, elims, castaways, tribes,
      { leagueSettings, baseEventRules, basePredictionRules },
      basePredictions, leagueEvents,
      selectionTimeline, episodes, additions
    ] = await Promise.all([
      SEASON_QUERIES.getBaseEvents(league.leagueSeason),
      SEASON_QUERIES.getTribesTimeline(league.leagueSeason),
      SEASON_QUERIES.getEliminations(league.leagueSeason),
      SEASON_QUERIES.getCastaways(league.leagueSeason),
      SEASON_QUERIES.getTribes(league.leagueSeason),

      this.getLeagueConfig(leagueHash),
      this.getBasePredictions(leagueHash),
      this.getLeagueEvents(leagueHash),
      this.getSelectionTimeline(leagueHash),

      this.getEpisodes(leagueHash, 100), // move to seasons
      SYS_QUERIES.fetchAdditions(),
    ]);

    const { scores, currentStreaks } = compileScores(
      baseEvents, baseEventRules ?? defaultBaseRules,
      basePredictions, basePredictionRules ?? defaultPredictionRules,
      leagueEvents, selectionTimeline, tribesTimeline, elims,
      leagueSettings.survivalCap, leagueSettings.preserveStreak);

    return {
      episodes,
      castaways: [...castaways, ...additions],
      tribes,
      leagueEvents,
      baseEvents,
      baseEventRules: baseEventRules as BaseEventRule,
      basePredictions,
      basePredictionRules,
      selectionTimeline,
      scores,
      currentStreaks,
    };
  },

  /**
    * Get this weeks predictions for a league, episode, and member
    * @param leagueHash - the hash of the league
    * @returns the predictions for the league for this week
    * @throws an error if the user is not a member of the league
    */
  getThisWeeksPredictions: async function(leagueHash: LeagueHash) {
    const { memberId, league, seasonName } = await leagueMemberAuth(leagueHash);
    // If the user is not a member of the league, throw an error
    if (!memberId || !league) {
      throw new Error('User not a member of the league');
    }

    // If the league is inactive, return nothing
    if (league.leagueStatus === 'Inactive') return;

    const episodes = await this.getEpisodes(leagueHash, 100);
    if (!episodes || episodes.length === 0) return;
    if (episodes.some((episode) => episode.airStatus === 'Airing')) return;
    const nextEpisode = episodes.find((episode) => episode.airStatus === 'Upcoming');
    if (!nextEpisode) return;

    const lastEpisode = episodes[nextEpisode.episodeNumber - 2];
    const mergeEpisode = episodes.find((episode) => episode.isMerge);

    const timingFilter = ({ timing }: { timing: PredictionEventTiming[] }) => {
      // Draft takes precedence if included in the list: 
      // - if the league is in draft status
      // - if there are no previous episodes
      // - if the draft date is after the last aired episode
      if (timing.includes('Draft') && (league.leagueStatus === 'Draft' || !lastEpisode ||
        league.draftDate > lastEpisode.episodeAirDate)) return true;
      // Weekly takes precedence if included in the list and draft checks fail
      else if (timing.includes('Weekly')) return true;
      // Likewise for weekly premerge and postmerge
      // Weekly premerge only if included in the list and no merge episode
      else if (timing.includes('Weekly (Premerge only)') &&
        !mergeEpisode) return true;
      // Weekly postmerge only if included in the list and merge episode exists
      else if (timing.includes('Weekly (Postmerge only)') &&
        !!mergeEpisode) return true;
      // After merge only if included in the list and merge episode is last aired
      else if (timing.includes('After Merge') &&
        !!lastEpisode?.isMerge) return true;
      // Before finale only if included in the list and next episode is the finale
      else if (timing.includes('Before Finale') &&
        !!nextEpisode?.isFinale) return true;

      return false;
    };

    const basePredictionRulesPromise = this.getLeagueConfig(leagueHash)
      .then((config) => {
        ScoringBaseEventNames.forEach((eventName) => {
          const rule = config.basePredictionRules[eventName];
          config.basePredictionRules[eventName].enabled = rule.enabled && timingFilter(rule);
        });
        return config.basePredictionRules;
      });

    const basePredictionsPromise = db
      .select({
        eventName: baseEventPredictionsSchema.baseEventName,
        episodeNumber: episodesSchema.episodeNumber,
        predictionMade: {
          referenceType: baseEventPredictionsSchema.referenceType,
          referenceId: baseEventPredictionsSchema.referenceId,
          bet: baseEventPredictionsSchema.bet,
        }
      })
      .from(baseEventPredictionsSchema)
      .innerJoin(leagueMembersSchema, and(
        eq(leagueMembersSchema.memberId, baseEventPredictionsSchema.memberId),
        eq(leagueMembersSchema.memberId, memberId)))
      .innerJoin(episodesSchema, and(
        eq(episodesSchema.episodeId, baseEventPredictionsSchema.episodeId),
        eq(episodesSchema.episodeId, nextEpisode.episodeId)));

    const customPredictionsPromise = db
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
      })
      .from(leagueEventsRulesSchema)
      .leftJoin(leagueEventPredictionsSchema, and(
        eq(leagueEventPredictionsSchema.leagueEventRuleId, leagueEventsRulesSchema.leagueEventRuleId),
        eq(leagueEventPredictionsSchema.memberId, memberId),
        eq(leagueEventPredictionsSchema.episodeId, nextEpisode.episodeId)))
      .where(and(
        eq(leagueEventsRulesSchema.leagueId, league.leagueId),
        eq(leagueEventsRulesSchema.eventType, 'Prediction')))
      .then((predictions) => predictions
        .filter(timingFilter)
        .map((prediction) => {
          const draftPrediction: LeaguePredictionDraft = {
            ...prediction,
            eventType: 'Prediction',
            // TODO: handle custom predictions with bets
            predictionMade: prediction.predictionMade ? {
              ...prediction.predictionMade,
              bet: null
            } : null
          };
          return draftPrediction;
        }));

    const [basePredictionRules, basePredictions, customPredictions, castaways] = await Promise.all([
      basePredictionRulesPromise, basePredictionsPromise, customPredictionsPromise,
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

    return {
      basePredictionRules,
      basePredictions,
      customPredictions,
      castaways: remainingCastaways,
      tribes,
      nextEpisode
    };
  },

  /**
    * Get all predictions made by the logged in user 
    * @param leagueHash - the hash of the league
    * @param otherMemberId - the member to get predictions for if undefined gets for logged in user
    * @returns the predictions made by the logged in user
    * @throws an error if the user is not authenticated
    */
  getMyPredictions: async function(leagueHash: LeagueHash, otherMemberId?: number) {
    const { memberId, league } = await leagueMemberAuth(leagueHash);
    // If the user is not a member of the league, throw an error
    if (!memberId || !league) {
      throw new Error('User not a member of the league');
    }

    const castawayPrediction = aliasedTable(castawaysSchema, 'castawayPrediction');
    const tribePrediction = aliasedTable(tribesSchema, 'tribePrediction');
    const episodesPrediction = aliasedTable(episodesSchema, 'episodesPrediction');

    const leaguePredictions = db
      .select({
        leagueMember: leagueMembersSchema.displayName,
        eventName: leagueEventsRulesSchema.eventName,
        leagueEventRuleId: leagueEventPredictionsSchema.leagueEventRuleId,
        points: leagueEventsRulesSchema.points,
        timing: leagueEventsRulesSchema.timing,
        prediction: {
          episodeNumber: episodesPrediction.episodeNumber,
          castaway: castawayPrediction.fullName,
          castawayShort: castawayPrediction.shortName,
          tribe: tribePrediction.tribeName,
          referenceType: leagueEventPredictionsSchema.referenceType,
          referenceId: leagueEventPredictionsSchema.referenceId,
        },
        result: {
          episodeNumber: episodesSchema.episodeNumber,
          castaway: castawaysSchema.fullName,
          castawayShort: castawaysSchema.shortName,
          tribe: tribesSchema.tribeName,
          referenceType: leagueEventsSchema.referenceType,
          referenceId: leagueEventsSchema.referenceId,
        }
      })
      .from(leagueEventPredictionsSchema)
      .innerJoin(leagueEventsRulesSchema, eq(leagueEventsRulesSchema.leagueEventRuleId, leagueEventPredictionsSchema.leagueEventRuleId))
      .innerJoin(leagueMembersSchema, and(
        eq(leagueMembersSchema.memberId, leagueEventPredictionsSchema.memberId),
        eq(leagueMembersSchema.leagueId, leagueEventsRulesSchema.leagueId),
        eq(leagueMembersSchema.leagueId, league.leagueId)))
      .innerJoin(episodesPrediction, eq(episodesPrediction.episodeId, leagueEventPredictionsSchema.episodeId))
      .leftJoin(castawayPrediction, and(
        eq(castawayPrediction.castawayId, leagueEventPredictionsSchema.referenceId),
        eq(leagueEventPredictionsSchema.referenceType, 'Castaway')))
      .leftJoin(tribePrediction, and(
        eq(tribePrediction.tribeId, leagueEventPredictionsSchema.referenceId),
        eq(leagueEventPredictionsSchema.referenceType, 'Tribe')))
      .leftJoin(leagueEventsSchema, and(
        eq(leagueEventsSchema.leagueEventRuleId, leagueEventPredictionsSchema.leagueEventRuleId),
        or(
          // if the prediction episode matches the event for weekly predictions
          and(
            eq(leagueEventPredictionsSchema.episodeId, leagueEventsSchema.episodeId),
            arrayOverlaps(leagueEventsRulesSchema.timing, ['Weekly', 'Weekly (Premerge only)', 'Weekly (Postmerge only)'])),
          // if the event is not weekly, the episode doesn't matter
          // note manual predictions should not be possible but just in case
          arrayOverlaps(leagueEventsRulesSchema.timing, PredictionTimingOptions
            .filter(timing => !timing.includes('Weekly'))))))
      .leftJoin(episodesSchema, eq(episodesSchema.episodeId, leagueEventsSchema.episodeId))
      .leftJoin(castawaysSchema, and(
        eq(castawaysSchema.castawayId, leagueEventsSchema.referenceId),
        eq(leagueEventsSchema.referenceType, 'Castaway')))
      .leftJoin(tribesSchema, and(
        eq(tribesSchema.tribeId, leagueEventsSchema.referenceId),
        eq(leagueEventsSchema.referenceType, 'Tribe')))
      .where(and(
        eq(leagueEventPredictionsSchema.memberId, otherMemberId ?? memberId),
        eq(leagueMembersSchema.leagueId, league.leagueId),
        sql`(${episodesPrediction.airDate} < ${new Date().toUTCString()})`))
      .then((predictions: {
        leagueMember: LeagueMemberDisplayName,
        eventName: LeagueEventName,
        leagueEventRuleId: LeagueEventId,
        points: number,
        timing: PredictionEventTiming[]
        prediction: {
          episodeNumber: EpisodeNumber,
          castaway: CastawayName | null,
          castawayShort: CastawayName | null,
          tribe: TribeName | null
          referenceType: ReferenceType,
          referenceId: number,
        },
        result: {
          episodeNumber: EpisodeNumber | null,
          castaway: CastawayName | null,
          castawayShort: CastawayName | null,
          tribe: TribeName | null
          referenceType: ReferenceType | null,
          referenceId: number | null,
        }
      }[]) => predictions.reduce((acc, prediction) => {
        const episodeNumber = prediction.prediction.episodeNumber;
        acc[episodeNumber] ??= [];

        let predictionIndex = acc[episodeNumber].findIndex((p) =>
          p.leagueEventRuleId === prediction.leagueEventRuleId);
        if (predictionIndex === -1) {
          acc[episodeNumber].push({
            leagueMember: prediction.leagueMember,
            eventName: prediction.eventName,
            leagueEventRuleId: prediction.leagueEventRuleId,
            points: prediction.points,
            timing: prediction.timing,
            prediction: { ...prediction.prediction, bet: null },
            results: [],
          });
          predictionIndex = acc[episodeNumber].length - 1;
        }

        if (prediction.result.episodeNumber !== null) {
          acc[episodeNumber][predictionIndex]!.results.push(prediction.result);
        }

        return acc;
      }, {} as Record<EpisodeNumber, Prediction[]>));

    const baseEventRules = db
      .select()
      .from(baseEventRulesSchema)
      .where(eq(baseEventRulesSchema.leagueId, league.leagueId))
      .then((rules) => rules[0] as BaseEventRule);

    const [leaguePredictionsData, baseEventRulesData] = await Promise.all([
      leaguePredictions, baseEventRules
    ]);

    const basePredictionsData = await db
      .select({
        leagueMember: leagueMembersSchema.displayName,
        eventName: baseEventPredictionsSchema.baseEventName,
        episodeNumber: episodesSchema.episodeNumber,
        prediction: {
          castaway: castawayPrediction.fullName,
          castawayShort: castawayPrediction.shortName,
          tribe: tribePrediction.tribeName,
          referenceType: baseEventPredictionsSchema.referenceType,
          referenceId: baseEventPredictionsSchema.referenceId,
          bet: baseEventPredictionsSchema.bet,
        },
        result: {
          castaway: castawaysSchema.fullName,
          castawayShort: castawaysSchema.shortName,
          tribe: tribesSchema.tribeName,
          referenceType: baseEventReferenceSchema.referenceType,
          referenceId: baseEventReferenceSchema.referenceId,
        }
      })
      .from(baseEventPredictionsSchema)
      .innerJoin(leagueMembersSchema, and(
        eq(leagueMembersSchema.memberId, baseEventPredictionsSchema.memberId),
        eq(leagueMembersSchema.leagueId, league.leagueId)))
      .innerJoin(episodesSchema, eq(episodesSchema.episodeId, baseEventPredictionsSchema.episodeId))
      .leftJoin(castawayPrediction, and(
        eq(castawayPrediction.castawayId, baseEventPredictionsSchema.referenceId),
        eq(baseEventPredictionsSchema.referenceType, 'Castaway')))
      .leftJoin(tribePrediction, and(
        eq(tribePrediction.tribeId, baseEventPredictionsSchema.referenceId),
        eq(baseEventPredictionsSchema.referenceType, 'Tribe')))
      .leftJoin(baseEventsSchema, and(
        eq(
          sql`cast(${baseEventsSchema.eventName} as varchar)`,
          sql`cast(${baseEventPredictionsSchema.baseEventName} as varchar)`),
        eq(baseEventsSchema.episodeId, episodesSchema.episodeId)))
      .leftJoin(baseEventReferenceSchema, eq(baseEventReferenceSchema.baseEventId, baseEventsSchema.baseEventId))
      .leftJoin(castawaysSchema, and(
        eq(castawaysSchema.castawayId, baseEventReferenceSchema.referenceId),
        eq(baseEventReferenceSchema.referenceType, 'Castaway')))
      .leftJoin(tribesSchema, and(
        eq(tribesSchema.tribeId, baseEventReferenceSchema.referenceId),
        eq(baseEventReferenceSchema.referenceType, 'Tribe')))
      .where(and(
        eq(baseEventPredictionsSchema.memberId, otherMemberId ?? memberId),
        sql`(${episodesSchema.airDate} < ${new Date().toUTCString()})`))
      .then((predictions: {
        leagueMember: LeagueMemberDisplayName,
        eventName: ScoringBaseEventName,
        episodeNumber: EpisodeNumber,
        prediction: {
          castaway: CastawayName | null,
          castawayShort: CastawayName | null,
          tribe: TribeName | null
          referenceType: ReferenceType,
          referenceId: number,
          bet: number | null,
        },
        result: {
          castaway: CastawayName | null,
          castawayShort: CastawayName | null,
          tribe: TribeName | null
          referenceType: ReferenceType | null,
          referenceId: number | null,
        }
      }[]) => predictions.reduce((acc, prediction) => {
        acc[prediction.episodeNumber] ??= [];
        let predictionIndex = acc[prediction.episodeNumber]!.findIndex((p) =>
          p.eventName === prediction.eventName &&
          p.prediction.episodeNumber === prediction.episodeNumber);

        if (predictionIndex === -1) {
          acc[prediction.episodeNumber]!.push({
            leagueMember: prediction.leagueMember,
            eventName: prediction.eventName,
            leagueEventRuleId: null,
            points: baseEventRulesData[prediction.eventName],
            timing: [],
            prediction: { ...prediction.prediction, episodeNumber: prediction.episodeNumber },
            results: [],
          });
          predictionIndex = acc[prediction.episodeNumber]!.length - 1;
        }

        if (prediction.result.referenceId !== null) {
          acc[prediction.episodeNumber]![predictionIndex]!.results.push({
            ...prediction.result,
            episodeNumber: prediction.episodeNumber
          });
        }

        return acc;
      }, {} as Record<EpisodeNumber, Prediction[]>));


    const combinedPredictions: Record<EpisodeNumber, Prediction[]> = {};
    Object.entries(basePredictionsData).forEach(([episodeNumber, predictions]) => {
      combinedPredictions[+episodeNumber] = predictions;
    });
    Object.entries(leaguePredictionsData).forEach(([episodeNumber, predictions]) => {
      combinedPredictions[+episodeNumber] ??= [];
      combinedPredictions[+episodeNumber]!.push(...predictions);
    });

    return combinedPredictions;
  },

  /**
    * Get chat history for a league
    * @param leagueHash - the hash of the league
    * @return the chat history for the league
    * @throws an error if the user is not a member of the league
    */
  getChatHistory: async function(leagueHash: LeagueHash) {
    const { memberId, league } = await leagueMemberAuth(leagueHash);
    // If the user is not a member of the league, throw an error
    if (!memberId || !league) {
      throw new Error('User not a member of the league');
    }

    const messageData = await db
      .select()
      .from(leagueChatSchema)
      .where(eq(leagueChatSchema.leagueHash, leagueHash));

    const messages: Message[] = messageData.map((message) => ({
      ...message,
      headers: {
        'sent-by-id': message.sentById,
      },
      clientId: leagueHash,
      timestamp: new Date(`${message.timestamp} Z`),
    } as unknown as Message));

    return messages;
  },

  /**
    * Get the ShauhinMode settings for a league
    * @param leagueHash - the hash of the league
    * @return the ShauhinMode settings for the league
    * @throws an error if the user is not a member of the league
    */
  getShauhinModeSettings: async function(leagueHash: LeagueHash) {
    const { memberId, league } = await leagueMemberAuth(leagueHash);
    // If the user is not a member of the league, throw an error
    if (!memberId || !league) {
      throw new Error('User not a member of the league');
    }

    const episodesPromise = this.getEpisodes(leagueHash, 100);

    const shauhinModeSettingsPromise = db
      .select()
      .from(shauhinModeSettingsSchema)
      .where(eq(shauhinModeSettingsSchema.leagueId, league.leagueId))
      .then((settings) => settings[0]);

    const [episodes, shauhinModeSettings] = await Promise.all([
      episodesPromise, shauhinModeSettingsPromise
    ]);

    if (shauhinModeSettings) {
      const { startWeek, customStartWeek } = shauhinModeSettings;

      // If start week is Custom make sure we are past the week
      if (startWeek === 'Custom' &&
        episodes.find((ep) => ep.episodeNumber === customStartWeek - 1)?.airStatus === 'Upcoming') {
        // MARK AS NOT READY
      }
      // If start week is After Merge and we are not past the merge episode, mark as not ready

      // If start week is Before Finale and we are not past the finale episode, mark as not ready

      // NOTE: If start week is Premiere, we are always ready
    }

    return shauhinModeSettings;
  },

  /**
    * Get and calculate the score for the logged in user for a league
    * @param leagueHash - the hash of the league
    * @return the score for the logged in user
    * @throws an error if the user is not a member of the league
    */
  getMyScore: async function(leagueHash: LeagueHash) {
    const { memberId, member, league } = await leagueMemberAuth(leagueHash);
    // If the user is not a member of the league, throw an error
    if (!memberId || !league) {
      throw new Error('User not a member of the league');
    }

    const [
      baseEvents, tribesTimeline, elims,
      { leagueSettings, baseEventRules, basePredictionRules },
      basePredictions, leagueEvents,
      selectionTimeline
    ] = await Promise.all([
      SEASON_QUERIES.getBaseEvents(league.leagueSeason),
      SEASON_QUERIES.getTribesTimeline(league.leagueSeason),
      SEASON_QUERIES.getEliminations(league.leagueSeason),

      this.getLeagueConfig(leagueHash),
      this.getBasePredictions(leagueHash),
      this.getLeagueEvents(leagueHash),
      this.getSelectionTimeline(leagueHash),
    ]);

    const { scores, currentStreaks } = compileScores(
      baseEvents, baseEventRules ?? defaultBaseRules,
      basePredictions, basePredictionRules ?? defaultPredictionRules,
      leagueEvents, selectionTimeline, tribesTimeline, elims,
      leagueSettings.survivalCap, leagueSettings.preserveStreak);

    return {
      points: scores.Member?.[member!.displayName]?.pop() ?? 0,
      currentStreak: currentStreaks[member!.displayName] ?? 0
    };
  }

};
