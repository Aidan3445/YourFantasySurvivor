import { aliasedTable, and, desc, eq, inArray } from 'drizzle-orm';
import 'server-only';

import { db } from '~/server/db';
import { type CastawayName } from '~/server/db/defs/castaways';
import { type EpisodeNumber } from '~/server/db/defs/episodes';
import { type BaseEvent, type BaseEventId } from '~/server/db/defs/events';
import { type SeasonId } from '~/server/db/defs/seasons';
import { type TribeName, type TribeUpdate } from '~/server/db/defs/tribes';
import { baseEventReferenceSchema, baseEventsSchema } from '~/server/db/schema/baseEvents';
import { castawaysSchema } from '~/server/db/schema/castaways';
import { episodesSchema } from '~/server/db/schema/episodes';
import { tribesSchema } from '~/server/db/schema/tribes';

export const QUERIES = {
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
        referenceType: baseEventReferenceSchema.referenceType,
        castaway: castawaysSchema.fullName,
        tribe: tribesSchema.tribeName,
        keywords: baseEventsSchema.keywords,
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
          eventName: row.eventName,
          castaways: [],
          tribes: [],
          keywords: row.keywords,
          notes: row.notes
        };
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
      .innerJoin(baseEventsSchema, and(
        eq(episodesSchema.episodeId, baseEventsSchema.episodeId),
        inArray(baseEventsSchema.eventName, ['elim', 'noVoteExit'])))
      .innerJoin(baseEventReferenceSchema, and(
        eq(baseEventsSchema.baseEventId, baseEventReferenceSchema.baseEventId),
        eq(baseEventReferenceSchema.referenceType, 'Castaway')))
      .innerJoin(castawaysSchema, eq(baseEventReferenceSchema.referenceId, castawaysSchema.castawayId))
      .where(eq(episodesSchema.seasonId, seasonId))
      .then((rows) => rows.reduce((acc, row) => {
        acc[row.episodeNumber] ??= [];
        acc[row.episodeNumber]!.push(row.castaway);

        return acc;
      }, [] as CastawayName[][]));
  }
};
