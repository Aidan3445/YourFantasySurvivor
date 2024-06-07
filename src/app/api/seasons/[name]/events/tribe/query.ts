import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { and, eq, isNotNull, not } from "drizzle-orm";
import { db } from "~/server/db";
import { seasons } from "~/server/db/schema/seasons";
import { baseEventTribes, baseEventCastaways, baseEvents, episodes, type EventName } from "~/server/db/schema/episodes";
import { tribes } from "~/server/db/schema/tribes";
import { castaways } from "~/server/db/schema/castaways";

export type TribeEvent = {
    tribe: string;
    name: EventName;
    episode: number;
};

export type TribeUpdates = Record<number, Record<string, string[]>>;

export async function getTribeEvents(
    seasonName: string, tribeName: string | null
): Promise<TribeEvent[]> {

    return db.select({
        tribe: tribes.name,
        name: baseEvents.name,
        episode: episodes.number,
    }).from(baseEventTribes)
        .innerJoin(baseEvents, eq(baseEvents.id, baseEventTribes.event))
        .innerJoin(episodes, eq(episodes.id, baseEvents.episode))
        .innerJoin(seasons, eq(seasons.id, episodes.season))
        .innerJoin(tribes, eq(tribes.id, baseEventTribes.tribe))
        .where(and(
            eq(seasons.name, seasonName),
            not(eq(baseEvents.name, "tribeUpdate")),
            tribeName
                ? eq(tribes.name, tribeName)
                : isNotNull(tribes.name)));
}

export async function getTribeUpdates(
    seasonName: string, tribeName: string | null
) {
    const rows = db.select({
        tribe: tribes.name,
        castaway: castaways.shortName,
        episode: episodes.number,
    }).from(baseEventTribes)
        .innerJoin(baseEvents, eq(baseEvents.id, baseEventTribes.event))
        .innerJoin(episodes, eq(episodes.id, baseEvents.episode))
        .innerJoin(seasons, eq(seasons.id, episodes.season))
        .innerJoin(tribes, eq(tribes.id, baseEventTribes.tribe))
        .innerJoin(baseEventCastaways, eq(baseEvents.id, baseEventCastaways.event))
        .innerJoin(castaways, eq(castaways.id, baseEventCastaways.castaway))
        .where(and(
            eq(seasons.name, seasonName),
            eq(baseEvents.name, "tribeUpdate"),
            tribeName
                ? eq(tribes.name, tribeName)
                : isNotNull(tribes.name)));

    return rows.then((updates) => updates.reduce((acc, { tribe, castaway, episode },) => {
        // initialize the episode if it doesn't exist
        if (!acc[episode]) {
            acc[episode] = {};
        }

        // initialize the tribe if it doesn't exist
        const update = acc[episode]!;
        if (!update[tribe]) {
            update[tribe] = [];
        }

        // add the castaway to the tribe update
        const newUpdate = update[tribe]!;
        newUpdate.push(castaway);
        return acc;
    }, {} as TribeUpdates));



}
