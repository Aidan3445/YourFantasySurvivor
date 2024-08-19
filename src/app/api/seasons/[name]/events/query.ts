import "server-only";
import { desc, and, eq, not, or } from "drizzle-orm";
import { db } from "~/server/db";
import { seasons } from "~/server/db/schema/seasons";
import {
  baseEventTribes,
  baseEventCastaways,
  baseEvents,
  type EventName,
  episodes,
} from "~/server/db/schema/episodes";
import { tribes } from "~/server/db/schema/tribes";
import { castaways } from "~/server/db/schema/castaways";

export type CastawayEvent = {
  castaway: string;
  name: EventName;
  episode: number;
};

export async function getCastawayEvents(
  seasonName: string,
  castawayName: string | null,
): Promise<CastawayEvent[]> {
  return db
    .select({
      castaway: castaways.shortName,
      name: baseEvents.name,
      episode: episodes.number,
    })
    .from(baseEventCastaways)
    .innerJoin(baseEvents, eq(baseEvents.id, baseEventCastaways.event))
    .innerJoin(episodes, eq(episodes.id, baseEvents.episode))
    .innerJoin(seasons, eq(seasons.id, episodes.season))
    .innerJoin(castaways, eq(castaways.id, baseEventCastaways.castaway))
    .where(
      and(
        eq(seasons.name, seasonName),
        not(eq(baseEvents.name, "tribeUpdate")),
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
  name: EventName;
  episode: number;
};

export async function getTribeEvents(
  seasonName: string,
  tribeName: string | null,
): Promise<TribeEvent[]> {
  return db
    .select({
      tribe: tribes.name,
      name: baseEvents.name,
      episode: episodes.number,
    })
    .from(baseEventTribes)
    .innerJoin(baseEvents, eq(baseEvents.id, baseEventTribes.event))
    .innerJoin(episodes, eq(episodes.id, baseEvents.episode))
    .innerJoin(seasons, eq(seasons.id, episodes.season))
    .innerJoin(tribes, eq(tribes.id, baseEventTribes.tribe))
    .where(
      and(
        eq(seasons.name, seasonName),
        not(eq(baseEvents.name, "tribeUpdate")),
        eq(tribes.name, tribeName ?? tribes.name),
      ),
    );
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
    .innerJoin(baseEvents, eq(baseEvents.id, baseEventTribes.event))
    .innerJoin(episodes, eq(episodes.id, baseEvents.episode))
    .innerJoin(seasons, eq(seasons.id, episodes.season))
    .innerJoin(tribes, eq(tribes.id, baseEventTribes.tribe))
    .innerJoin(baseEventCastaways, eq(baseEvents.id, baseEventCastaways.event))
    .innerJoin(castaways, eq(castaways.id, baseEventCastaways.castaway))
    .where(
      and(eq(seasons.name, seasonName), eq(baseEvents.name, "tribeUpdate")),
    );

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
