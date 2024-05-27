import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { seasons } from "~/server/db/schema/seasons";
import { episodes } from "~/server/db/schema/episodes";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;

    if (!searchParams.has("season")) {
        // get episodes from most recent season if no season is provided
        const season = await db.select().from(seasons).orderBy(desc(seasons.premierDate)).limit(1);
        const res = await db.select()
            .from(episodes)
            .where(eq(episodes.season, season[0]?.id ?? -1));
        return NextResponse.json(res);
    } else if (searchParams.has("number")) {
        // get specific episode from a season if both season and number are provided
        const res = await db.select()
            .from(episodes)
            .where(and(
                eq(episodes.season, parseInt(searchParams.get("season") ?? "-1")),
                eq(episodes.number, parseInt(searchParams.get("number") ?? "-1"))
            ));
        return NextResponse.json(res);
    } else {
        // get all episodes from a season if only season is provided
        const res = await db.select()
            .from(episodes)
            .where(eq(episodes.season, parseInt(searchParams.get("season") ?? "-1")));
        return NextResponse.json(res);
    }
}
