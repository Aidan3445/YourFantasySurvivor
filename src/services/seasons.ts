import { aliasedTable, and, asc, desc, eq, inArray, lte } from 'drizzle-orm';
import 'server-only';

import { db } from '~/server/db';
import { type CastawayImage, type CastawayDetails, type CastawayName, type CastawayId } from '~/server/db/defs/castaways';
import { type EpisodeNumber } from '~/server/db/defs/episodes';
import { type BaseEventName, type BaseEvent, type BaseEventId } from '~/server/db/defs/events';
import { type SeasonId } from '~/server/db/defs/seasons';
import { type TribeEp, type TribeName, type TribeUpdate } from '~/server/db/defs/tribes';
import { baseEventReferenceSchema, baseEventsSchema } from '~/server/db/schema/baseEvents';
import { castawaysSchema } from '~/server/db/schema/castaways';
import { episodesSchema } from '~/server/db/schema/episodes';
import { seasonsSchema } from '~/server/db/schema/seasons';
import { tribesSchema } from '~/server/db/schema/tribes';

export const seasonsService = {
  /**
    * Get the current seasons
    * @returns The current seasons
    */
  getCurrentSeasons: async function() {
    return await db
      .select()
      .from(seasonsSchema)
      .orderBy(asc(seasonsSchema.premiereDate))
      .then(rows => rows.filter(row =>
        new Date(`${row.premiereDate} Z`) <= new Date() &&
        (row.finaleDate === null || new Date(`${row.finaleDate} Z`) >= new Date())));
  },
  /**
    * Get the base events for a season
    * @param seasonId The season to get scores for
    * @returns The base events for the season organized by episode
    */
  getBaseEvents: async function(seasonId: SeasonId) {
    return await db
      .select({
        episodeNumber: episodesSchema.episodeNumber,
        baseEventId: baseEventsSchema.baseEventId,
        eventName: baseEventsSchema.eventName,
        label: baseEventsSchema.label,
        referenceType: baseEventReferenceSchema.referenceType,
        referenceId: baseEventReferenceSchema.referenceId,
        castaway: castawaysSchema.fullName,
        tribe: tribesSchema.tribeName,
        notes: baseEventsSchema.notes
      })
      .from(baseEventsSchema)
      .innerJoin(episodesSchema, eq(baseEventsSchema.episodeId, episodesSchema.episodeId))
      .innerJoin(baseEventReferenceSchema, eq(baseEventsSchema.baseEventId, baseEventReferenceSchema.baseEventId))
      .leftJoin(castawaysSchema, and(
        eq(baseEventReferenceSchema.referenceId, castawaysSchema.castawayId),
        eq(baseEventReferenceSchema.referenceType, 'Castaway')))
      .leftJoin(tribesSchema, and(
        eq(baseEventReferenceSchema.referenceId, tribesSchema.tribeId),
        eq(baseEventReferenceSchema.referenceType, 'Tribe')))
      .where(eq(episodesSchema.seasonId, seasonId))
      .then((rows) => rows.reduce((acc, row) => {
        acc[row.episodeNumber] ??= {};
        const events = acc[row.episodeNumber]!;
        events[row.baseEventId] ??= {
          baseEventId: row.baseEventId,
          referenceType: row.referenceType,
          references: [],
          eventName: row.eventName,
          label: row.label,
          castaways: [],
          tribes: [],
          notes: row.notes
        };
        events[row.baseEventId]!.references.push(row.referenceId);
        switch (row.referenceType) {
          case 'Castaway':
            events[row.baseEventId]!.castaways.push(row.castaway!);
            break;
          case 'Tribe':
            events[row.baseEventId]!.tribes.push(row.tribe!);
            break;
        }

        return acc;
      }, {} as Record<EpisodeNumber, Record<BaseEventId, BaseEvent>>));
  },

  /**
    * Get the members of each tribe for each episode in a season
    * @param seasonId The season to get scores for
    * @returns The members of each tribe for each episode
    */
  getTribesTimeline: async function(seasonId: SeasonId) {
    const tribeJoined = aliasedTable(baseEventReferenceSchema, 'tribeJoined');
    const castawayJoined = aliasedTable(baseEventReferenceSchema, 'castawayJoined');

    return db
      .select({
        episodeNumber: episodesSchema.episodeNumber,
        tribeName: tribesSchema.tribeName,
        tribeColor: tribesSchema.tribeColor,
        castaway: castawaysSchema.fullName,
      })
      .from(episodesSchema)
      .innerJoin(baseEventsSchema, and(
        eq(episodesSchema.episodeId, baseEventsSchema.episodeId),
        eq(baseEventsSchema.eventName, 'tribeUpdate')))
      .innerJoin(tribeJoined, and(
        eq(baseEventsSchema.baseEventId, tribeJoined.baseEventId),
        eq(tribeJoined.referenceType, 'Tribe')))
      .innerJoin(tribesSchema, eq(tribeJoined.referenceId, tribesSchema.tribeId))
      .innerJoin(castawayJoined, and(
        eq(baseEventsSchema.baseEventId, castawayJoined.baseEventId),
        eq(castawayJoined.referenceType, 'Castaway')))
      .innerJoin(castawaysSchema, eq(castawayJoined.referenceId, castawaysSchema.castawayId))
      .where(eq(episodesSchema.seasonId, seasonId))
      .orderBy(desc(episodesSchema.episodeNumber))
      .then((rows) => rows.reduce((acc, row) => {
        acc[row.episodeNumber] ??= {};
        const updates = acc[row.episodeNumber]!;
        updates[row.tribeName] ??= { tribeColor: row.tribeColor, castaways: [] };
        updates[row.tribeName]!.castaways.push(row.castaway);

        return acc;
      }, {} as Record<EpisodeNumber, Record<TribeName, TribeUpdate>>));
  },

  /**
    * Get the castaways eliminated in each episode of a season
    * @param seasonId The season to get eliminations for
    * @returns The castaways eliminated in each episode
    */
  getEliminations: async function(seasonId: SeasonId) {
    return db
      .select({
        episodeNumber: episodesSchema.episodeNumber,
        castaway: castawaysSchema.fullName,
      })
      .from(episodesSchema)
      .leftJoin(baseEventsSchema, and(
        eq(episodesSchema.episodeId, baseEventsSchema.episodeId),
        inArray(baseEventsSchema.eventName, ['elim', 'noVoteExit'])))
      .leftJoin(baseEventReferenceSchema, and(
        eq(baseEventsSchema.baseEventId, baseEventReferenceSchema.baseEventId),
        eq(baseEventReferenceSchema.referenceType, 'Castaway')))
      .leftJoin(castawaysSchema, eq(baseEventReferenceSchema.referenceId, castawaysSchema.castawayId))
      .where(and(
        eq(episodesSchema.seasonId, seasonId),
        lte(episodesSchema.airDate, new Date().toUTCString())))
      .then((rows) => rows.reduce((acc, row) => {
        acc[row.episodeNumber] ??= [];
        if (row.castaway !== null) {
          acc[row.episodeNumber]!.push(row.castaway);
        }

        return acc;
      }, [] as CastawayName[][]));
  },

  /**
    * Get the castaways for the season
    * @param seasonId The season to get castaways from
    * @returns The castaways for the season
    */
  getCastaways: async function(seasonId: SeasonId) {
    const castawayReference = aliasedTable(baseEventReferenceSchema, 'castawayReference');
    const tribeReference = aliasedTable(baseEventReferenceSchema, 'tribeReference');

    const rows = await db
      .select({
        castawayId: castawaysSchema.castawayId,
        fullName: castawaysSchema.fullName,
        shortName: castawaysSchema.shortName,
        startingTribe: {
          tribeId: tribesSchema.tribeId,
          tribeName: tribesSchema.tribeName,
          tribeColor: tribesSchema.tribeColor,
          episode: episodesSchema.episodeNumber
        },
        imageUrl: castawaysSchema.imageUrl,
        episodeNumber: episodesSchema.episodeNumber,
        eventName: baseEventsSchema.eventName
      })
      .from(castawaysSchema)
      .innerJoin(castawayReference, and(
        eq(castawaysSchema.castawayId, castawayReference.referenceId),
        eq(castawayReference.referenceType, 'Castaway')))
      .innerJoin(baseEventsSchema, and(
        eq(baseEventsSchema.baseEventId, castawayReference.baseEventId),
        inArray(baseEventsSchema.eventName, ['tribeUpdate', 'elim', 'noVoteExit'])))
      .innerJoin(episodesSchema, eq(episodesSchema.episodeId, baseEventsSchema.episodeId))
      .innerJoin(seasonsSchema, and(
        eq(seasonsSchema.seasonId, castawaysSchema.seasonId),
        eq(seasonsSchema.seasonId, seasonId)))
      .leftJoin(tribeReference, and(
        eq(tribeReference.baseEventId, baseEventsSchema.baseEventId),
        eq(tribeReference.referenceType, 'Tribe')))
      .leftJoin(tribesSchema, eq(tribeReference.referenceId, tribesSchema.tribeId))
      .then((rows: {
        castawayId: CastawayId
        fullName: CastawayName,
        shortName: CastawayName,
        startingTribe: TribeEp,
        imageUrl: CastawayImage,
        episodeNumber: EpisodeNumber,
        eventName: BaseEventName
      }[]) => rows.sort((a, b) => {
        // sort tribe updates first then eliminations
        if (a.eventName !== 'tribeUpdate' && b.eventName === 'tribeUpdate') {
          return 1;
        } else if (a.eventName === 'tribeUpdate' && b.eventName !== 'tribeUpdate') {
          return -1;
        } else {
          // each by episode number ascending
          return a.episodeNumber - b.episodeNumber;
        }
      }));

    const castawaysWithTribes = rows.reduce((acc, row) => {
      const castaway = acc[row.fullName] ?? {
        castawayId: row.castawayId,
        fullName: row.fullName,
        shortName: row.shortName,
        startingTribe: row.startingTribe,
        tribes: [] as TribeEp[],
        imageUrl: row.imageUrl,
        eliminatedEpisode: null
      };
      if (row.eventName === 'tribeUpdate') {
        castaway.tribes.push(row.startingTribe);
      } else {
        castaway.eliminatedEpisode = row.episodeNumber;
      }
      acc[row.fullName] = castaway;
      return acc;
    }, {} as Record<string, CastawayDetails>);

    return Object.values(castawaysWithTribes).sort(
      (a, b) => a.startingTribe.tribeName.localeCompare(b.startingTribe.tribeName));
  },
  /**
  * Get all tribes for a season
  * @param seasonId The season to get tribes from
  * @returns The tribes for the season
  * @throws if the season does not exist
  */
  getTribes: async function(seasonId: SeasonId) {
    return db
      .select({
        tribeId: tribesSchema.tribeId,
        tribeName: tribesSchema.tribeName,
        tribeColor: tribesSchema.tribeColor,
      })
      .from(tribesSchema)
      .innerJoin(seasonsSchema, eq(tribesSchema.seasonId, seasonsSchema.seasonId))
      .where(eq(seasonsSchema.seasonId, seasonId))
      .then(rows => rows.map(row => ({
        tribeId: row.tribeId,
        tribeName: row.tribeName,
        tribeColor: row.tribeColor,
      })));
  },
  /**
    * Get season scores for the current seasons
    * @returns The scores for the season
    * @throws if the league does not exist
    */
  getSeasonScoreData: async function() {
    const currentSeasons = [{ seasonId: 15 }]; //await this.getCurrentSeasons();
    if (currentSeasons.length === 0) return [];

    const seasonScores = await Promise.all(currentSeasons.map(async (season) => {
      const [castaways, baseEvents, tribesTimeline, eliminations] = await Promise.all([
        this.getCastaways(season.seasonId),
        this.getBaseEvents(season.seasonId),
        this.getTribesTimeline(season.seasonId),
        this.getEliminations(season.seasonId),
      ]);

      return {
        castaways,
        baseEvents,
        tribesTimeline,
        eliminations,
        season: season,
      };
    }));

    return seasonScores;
  }
};
