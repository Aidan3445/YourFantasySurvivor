import { NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { episodes, seasons } from "~/server/db/schema";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;

    if (!searchParams.has("season")) {
        // get episodes from most recent season if no season is provided
        const season = await db.select().from(seasons).orderBy(desc(seasons.premierDate)).limit(1);
        const res = await db.select()
            .from(episodes)
            .where(eq(episodes.season, season[0]?.name ?? "Failed to get season"));
        return Response.json(res);
    } else if (searchParams.has("number")) {
        const res = await db.select()
            .from(episodes)
            .where(and(
                eq(episodes.season, searchParams.get("season") as string),
                eq(episodes.number, parseInt(searchParams.get("number") ?? "-1"))
            ));
        return Response.json(res);
    } else {
        const res = await db.select()
            .from(episodes)
            .where(eq(episodes.season, searchParams.get("season") as string));
        return Response.json(res);
    }
}
