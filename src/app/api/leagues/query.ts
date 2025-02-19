import 'server-only';

import { aliasedTable, and, arrayContained, arrayContains, asc, desc, eq, inArray } from 'drizzle-orm';
import { db } from '~/server/db';
import { leagueSettingsSchema, leaguesSchema } from '~/server/db/schema/leagues';
import { leagueMembersSchema, selectionUpdatesSchema } from '~/server/db/schema/leagueMembers';
import { seasonsSchema } from '~/server/db/schema/seasons';
import { leagueMemberAuth } from '~/lib/auth';
import { baseEventReferenceSchema, baseEventRulesSchema, baseEventsSchema } from '~/server/db/schema/baseEvents';
import { leagueEventPredictionsSchema, leagueEventsRulesSchema, leagueEventsSchema } from '~/server/db/schema/leagueEvents';
import { auth } from '@clerk/nextjs/server';
import { episodesSchema } from '~/server/db/schema/episodes';
import { castawaysSchema } from '~/server/db/schema/castaways';
import { type LeagueStatus, type LeagueHash, type LeagueName } from '~/server/db/defs/leagues';
import { type SeasonName } from '~/server/db/defs/seasons';
import { type CastawayDraftInfo, type CastawayName } from '~/server/db/defs/castaways';
import { tribesSchema } from '~/server/db/schema/tribes';
import { type LeagueMemberDisplayName, type LeagueMemberColor } from '~/server/db/defs/leagueMembers';
import { type LeagueEventPrediction, type LeagueDirectEvent, type ReferenceType, type LeaguePredictionEvent } from '~/server/db/defs/events';
import { QUERIES as SEASON_QUERIES } from '~/app/api/seasons/query';
import { type TribeName } from '~/server/db/defs/tribes';
import { type EpisodeNumber } from '~/server/db/defs/episodes';
import { compileScores } from './[leagueHash]/scores';

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
        //draftOver: !!(league.settings.draftDate && new Date() > new Date(league.settings.draftDate)),
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
        arrayContains(leagueEventsRulesSchema.timing, ['Draft'])))
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
    * @returns the next episode to air
    * @throws an error if the season does not exist
    * @throws if there are no episodes that have not aired
    */
  getNextEpisodeId: async function(leagueHash: LeagueHash) {
    const { memberId, league } = await leagueMemberAuth(leagueHash);
    // If the user is not a member of the league, throw an error
    if (!memberId || !league) {
      throw new Error('User not a member of the league');
    }

    return await db
      .select({ episodeId: episodesSchema.episodeId })
      .from(episodesSchema)
      .innerJoin(seasonsSchema, eq(seasonsSchema.seasonId, episodesSchema.seasonId))
      .where(eq(seasonsSchema.seasonId, league.leagueSeason))
      .orderBy(asc(episodesSchema.airDate))
      .limit(1)
      .then((res) => res[0]?.episodeId);
  },

  /**
    * Get the base event scores for a league
    * @param leagueHash - the hash of the league
    * @returns the base event scores for the league
    * @throws an error if the user is not a member of the league
    */
  getBaseEventScores: async function(leagueHash: LeagueHash) {
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
      baseEvents, tribes, elims, leagueEvents,
      baseEventRules, selectionTimeline, leagueSettings
    ] = await Promise.all([
      SEASON_QUERIES.getBaseEvents(league.leagueSeason),
      SEASON_QUERIES.getTribesTimeline(league.leagueSeason),
      SEASON_QUERIES.getEliminations(league.leagueSeason),

      QUERIES.getLeagueEvents(leagueHash),
      baseEventRulesPromise,
      QUERIES.getSelectionTimeline(leagueHash),
      leagueSettingsPromise
    ]);

    if (!baseEventRules || !leagueSettings) {
      throw new Error('League not found');
    }

    const scores = compileScores(
      baseEvents, tribes, elims, leagueEvents,
      baseEventRules, selectionTimeline, leagueSettings.survivalCap);

    return {
      scores,
      selectionTimeline
    };
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
        episodeNumber: episodesSchema.episodeNumber,
        leagueEventId: leagueEventsSchema.leagueEventId,
        eventName: leagueEventsRulesSchema.eventName,
        points: leagueEventsRulesSchema.points,
        referenceType: leagueEventsSchema.referenceType,
        castaway: castawaysSchema.fullName,
        tribe: tribesSchema.tribeName,
        member: leagueMembersSchema.displayName,
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
      .leftJoin(leagueMembersSchema, and(
        eq(leagueMembersSchema.memberId, leagueEventsSchema.referenceId),
        eq(leagueEventsSchema.referenceType, 'Member')))
      .then((events) => events.reduce((acc, event) => {
        acc[event.episodeNumber] ??= {
          Castaway: [],
          Tribe: [],
          Member: [],
        };

        const newEvent = {
          eventName: event.eventName,
          points: event.points,
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
          case 'Member':
            acc[event.episodeNumber]!.Member.push({ ...newEvent, referenceName: event.member! });
            break;
        }

        return acc;
      }, {} as Record<EpisodeNumber, Record<ReferenceType, LeagueDirectEvent[]>>));


    const predictionMaker = aliasedTable(leagueMembersSchema, 'predictionMaker');
    const predictionEventsPromise = db
      .select({
        eventName: leagueEventsRulesSchema.eventName,
        points: leagueEventsRulesSchema.points,
        episodeNumber: episodesSchema.episodeNumber,
        predictionMaker: predictionMaker.displayName,
        referenceType: leagueEventPredictionsSchema.referenceType,
        castaway: castawaysSchema.fullName,
        tribe: tribesSchema.tribeName,
        member: leagueMembersSchema.displayName,
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
        eq(leagueEventPredictionsSchema.episodeId, leagueEventsSchema.episodeId),
        eq(leagueEventPredictionsSchema.referenceId, leagueEventsSchema.referenceId)))
      .innerJoin(predictionMaker, eq(predictionMaker.memberId, leagueEventPredictionsSchema.memberId))
      // references
      .leftJoin(castawaysSchema, and(
        eq(castawaysSchema.castawayId, leagueEventsSchema.referenceId),
        eq(leagueEventsSchema.referenceType, 'Castaway')))
      .leftJoin(tribesSchema, and(
        eq(tribesSchema.tribeId, leagueEventsSchema.referenceId),
        eq(leagueEventsSchema.referenceType, 'Tribe')))
      .leftJoin(leagueMembersSchema, and(
        eq(leagueMembersSchema.memberId, leagueEventsSchema.referenceId),
        eq(leagueEventsSchema.referenceType, 'Member')))
      .then((events: {
        eventName: string,
        points: number,
        episodeNumber: EpisodeNumber,
        predictionMaker: string,
        referenceType: ReferenceType,
        castaway: CastawayName | null,
        tribe: TribeName | null,
        member: string | null,
        notes: string[] | null
      }[]

      ) => events.reduce((acc, event) => {
        acc[event.episodeNumber] ??= [];
        const newEvent = {
          eventName: event.eventName,
          points: event.points,
          referenceType: event.referenceType,
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
          case 'Member':
            acc[event.episodeNumber]!.push({ ...newEvent, referenceName: event.member! });
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
      if (previousSelection) {
        // fill in the episodes between
        acc[row.leagueMember]!.push(...Array(row.episodeNumber - latestUpdateEpisode)
          .fill(previousSelection) as CastawayName[]);
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
      const latestUpdateEpisode = acc[row.castaway] ? acc[row.castaway]!.length : 0;
      // castaways, unlike members may not be selected at the start of the season
      // so fill in the episodes between the start and the first selection
      acc[row.castaway] ??= Array(row.episodeNumber - 1).fill(null);
      // get the previous selection if it exists
      const previousSelection = acc[row.castaway]![latestUpdateEpisode - 1];
      if (previousSelection) {
        // fill in the episodes between
        acc[row.castaway]!.push(...Array(row.episodeNumber - latestUpdateEpisode)
          .fill(previousSelection) as LeagueMemberDisplayName[]);
      }
      // add the new selection
      acc[row.castaway]!.push(row.leagueMember);

      // for castaways we want to track when they are 'free agents'
      // so update the previous selection from the member to null
      const previousSelector = memberCastaways[row.leagueMember]?.[row.episodeNumber - 1];
      if (previousSelector === row.castaway) {
        // safe to assert defined since this selection updates are sorted by episodeNumber
        acc[previousSelector]!.push(...Array(row.episodeNumber - latestUpdateEpisode)
          .fill(row.leagueMember) as LeagueMemberDisplayName[]);
        acc[previousSelector]!.push(null);
      }
      return acc;
    }, {} as Record<CastawayName, (LeagueMemberDisplayName | null)[]>);

    return { memberCastaways, castawayMembers };
  },
};
