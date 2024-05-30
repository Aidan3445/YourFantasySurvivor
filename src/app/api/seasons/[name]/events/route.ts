import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { seasons } from "~/server/db/schema/seasons";
import { baseEventCastaways, baseEvents, episodes } from "~/server/db/schema/episodes";

export async function GET(req: NextRequest, { params }: { params: { name: string } }
) {
    const seasonName = params.name;
    const searchParams = req.nextUrl.searchParams;

    const castawayEvents = await db.select()
        .from(baseEventCastaways)
        .leftJoin(baseEvents, eq(baseEvents.id, baseEventCastaways.event))
        .leftJoin(episodes, eq(episodes.id, baseEvents.episode))
        .leftJoin(seasons, eq(seasons.id, episodes.season))
        .where(eq(seasons.name, seasonName));

    return NextResponse.json({ castawayEvents });
}


/*
    let seasonId;
    if (!searchParams.has("season")) {
        // get events from most recent season if no season is provided
        const getSeasons = await db.select({ id: seasons.id }).from(seasons).orderBy(desc(seasons.premierDate)).limit(1);
        if (getSeasons.length === 0) {
            return NextResponse.json("Error: No seasons found", { status: 404 });
        }
        seasonId = getSeasons[0]?.id;
    } else {
        const seasonName = searchParams.get("season");
        const getSeasons = await db.select({ id: seasons.id }).from(seasons).where(and(eq(seasons.name, seasonName ?? "")));
        if (getSeasons.length === 0) {
            return NextResponse.json("Error: Season not found", { status: 404 });
        }
        seasonId = getSeasons[0]?.id;
    }

    return NextResponse.json({ seasonId });
    */
