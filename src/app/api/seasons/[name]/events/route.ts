import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { seasons } from "~/server/db/schema/seasons";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;

    
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
