import "server-only";
import { and, desc, eq, isNotNull, not } from "drizzle-orm";
import { db } from "~/server/db";
import { seasons } from "~/server/db/schema/seasons";
import { baseEventCastaways, baseEvents, episodes, type EventName } from "~/server/db/schema/episodes";
import { castaways } from "~/server/db/schema/castaways";

export type CastawayEvent = {
    id: number;
    castaway: string;
    name: EventName;
    episode: number;
};

export async function getCastawayEvents(
    seasonName: string, castawayName: string | null
): Promise<CastawayEvent[]> {
    return db.select({
        id: baseEvents.id,
        castaway: castaways.shortName,
        name: baseEvents.name,
        episode: episodes.number,
    }).from(baseEventCastaways)
        .innerJoin(baseEvents, eq(baseEvents.id, baseEventCastaways.event))
        .innerJoin(episodes, eq(episodes.id, baseEvents.episode))
        .innerJoin(seasons, eq(seasons.id, episodes.season))
        .innerJoin(castaways, eq(castaways.id, baseEventCastaways.castaway))
        .where(and(
            eq(seasons.name, seasonName),
            not(eq(baseEvents.name, "tribeUpdate")),
            castawayName
                ? eq(castaways.name, castawayName)
                : isNotNull(castaways.name)))
        .orderBy(desc(episodes.number));

}
