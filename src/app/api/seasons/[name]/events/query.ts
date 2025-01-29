import 'server-only';
import { desc, and, eq, not, or } from 'drizzle-orm';
import { db } from '~/server/db';
import { seasons } from '~/server/db/schema/seasons';
import {
  baseEventTribes,
  baseEventCastaways,
  baseEvents,
  type EventName,
  episodes,
} from '~/server/db/schema/episodes';
import { tribes } from '~/server/db/schema/tribes';
import { castaways } from '~/server/db/schema/castaways';

export type CastawayEvent = {
  castaway: string;
  eventName: EventName;
  episode: number;
  notes: string[];
  keywords: string[];
};

export async function getCastawayEvents(
  seasonName: string,
  castawayName: string | null,
): Promise<CastawayEvent[]> {
  return db
    .select({
      castaway: castaways.shortName,
      eventName: baseEvents.eventName,
      episode: episodes.number,
      notes: baseEvents.notes,
      keywords: baseEvents.keywords,
    })
    .from(baseEventCastaways)
    .innerJoin(baseEvents, eq(baseEvents.baseEventId, baseEventCastaways.eventId))
    .innerJoin(episodes, eq(episodes.episodeId, baseEvents.episodeId))
    .innerJoin(seasons, eq(seasons.seasonId, episodes.seasonId))
    .innerJoin(castaways, eq(castaways.castawayId, baseEventCastaways.referenceId))
    .where(
      and(
        eq(seasons.seasonName, seasonName),
        not(eq(baseEvents.eventName, 'tribeUpdate')),
        or(
          eq(castaways.name, castawayName ?? castaways.name),
          eq(castaways.shortName, castawayName ?? castaways.shortName),
        ),
      ),
    )
    .orderBy(desc(episodes.number));
}

export type TribeEvent = {
  tribe: string;
  eventName: EventName;
  episode: number;
  notes: string[];
  keywords: string[];
};

export async function getTribeEvents(
  seasonName: string,
  tribeName: string | null,
): Promise<TribeEvent[]> {
  return db
    .select({
      tribe: tribes.name,
      eventName: baseEvents.eventName,
      episode: episodes.number,
      notes: baseEvents.notes,
      keywords: baseEvents.keywords,
    })
    .from(baseEventTribes)
    .innerJoin(baseEvents, eq(baseEvents.baseEventId, baseEventTribes.eventId))
    .innerJoin(episodes, eq(episodes.episodeId, baseEvents.episodeId))
    .innerJoin(seasons, eq(seasons.seasonId, episodes.seasonId))
    .innerJoin(tribes, eq(tribes.tribeId, baseEventTribes.referenceId))
    .where(
      and(
        eq(seasons.seasonName, seasonName),
        not(eq(baseEvents.eventName, 'tribeUpdate')),
        eq(tribes.name, tribeName ?? tribes.name),
      ),
    )
    .orderBy(desc(episodes.number));
}

export type TribeUpdates = Record<number, Record<string, string[]>>;

export async function getTribeUpdates(
  seasonName: string,
): Promise<TribeUpdates> {
  const rows = await db
    .select({
      tribe: tribes.name,
      castaway: castaways.shortName,
      episode: episodes.number,
    })
    .from(baseEventTribes)
    .innerJoin(baseEvents, eq(baseEvents.baseEventId, baseEventTribes.eventId))
    .innerJoin(episodes, eq(episodes.episodeId, baseEvents.episodeId))
    .innerJoin(seasons, eq(seasons.seasonId, episodes.seasonId))
    .innerJoin(tribes, eq(tribes.tribeId, baseEventTribes.referenceId))
    .innerJoin(baseEventCastaways, eq(baseEvents.baseEventId, baseEventCastaways.eventId))
    .innerJoin(castaways, eq(castaways.castawayId, baseEventCastaways.referenceId))
    .where(
      and(eq(seasons.seasonName, seasonName), eq(baseEvents.eventName, 'tribeUpdate')),
    )
    .orderBy(desc(episodes.number));

  return rows.reduce((acc, { tribe, castaway, episode }) => {
    // initialize the episode if it doesn't exist
    if (!acc[episode]) {
      acc[episode] = {};
    }

    // initialize the tribe if it doesn't exist
    const update = acc[episode];
    if (!update[tribe]) {
      update[tribe] = [];
    }

    // add the castaway to the tribe update
    const newUpdate = update[tribe];
    newUpdate.push(castaway);
    return acc;
  }, {} as TribeUpdates);
}

export type Events = {
  castawayEvents: CastawayEvent[];
  tribeEvents: TribeEvent[];
  tribeUpdates: TribeUpdates;
};
