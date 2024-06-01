import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "~/server/db";
import { seasons } from "~/server/db/schema/seasons";
import { baseEventCastaways, baseEvents, episodes } from "~/server/db/schema/episodes";
import { castaways } from "~/server/db/schema/castaways";

export async function GET(
    req: NextRequest,
    { params }: { params: { name: string } }
): Promise<NextResponse<CastawayEvent[]>> {
    const seasonName = params.name;
    const searchParams = req.nextUrl.searchParams;
    const castawayName = searchParams.get("castaway");

    const castawayEvents = await db.select({
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
            castawayName
                ? eq(castaways.name, castawayName)
                : isNotNull(castaways.name)))

    return NextResponse.json(castawayEvents);
}

export type CastawayEvent = {
    castaway: string;
    name: string;
    episode: number;
};
