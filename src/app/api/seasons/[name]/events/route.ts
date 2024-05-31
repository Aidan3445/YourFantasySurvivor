import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "~/server/db";
import { seasons } from "~/server/db/schema/seasons";
import { baseEventCastaways, baseEvents, episodes } from "~/server/db/schema/episodes";
import { castaways } from "~/server/db/schema/castaways";

export async function GET(req: NextRequest, { params }: { params: { name: string } }
) {
    const seasonName = params.name;
    const searchParams = req.nextUrl.searchParams;
    const castawayName = searchParams.get("castaway");

    const castawayEvents = await db.select({
        castaway: castaways.name,
        event: baseEvents.name,
        episodeNumber: episodes.number,
    }).from(baseEventCastaways)
        .leftJoin(baseEvents, eq(baseEvents.id, baseEventCastaways.event))
        .leftJoin(episodes, eq(episodes.id, baseEvents.episode))
        .leftJoin(seasons, eq(seasons.id, episodes.season))
        .leftJoin(castaways, eq(castaways.id, baseEventCastaways.castaway))
        .where(and(
            eq(seasons.name, seasonName),
            castawayName
                ? eq(castaways.name, castawayName)
                : isNotNull(castaways.name)));

    return NextResponse.json({ castawayEvents });
}
