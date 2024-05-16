import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { castaways } from "~/server/db/schema";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;

    if (!searchParams.has("tribe") && !searchParams.has("name")) {
        // either get all castaways if no tribe or name is provided
        const res = await db.select({ name: castaways.name }).from(castaways);
        return NextResponse.json(res);
    } else if (searchParams.has("name")) {
        // or get a specific castaway by their name
        const res = await db.select()
            .from(castaways)
            .where(eq(castaways.name, searchParams.get("name")));
        return NextResponse.json(res);
    } else {
        const res = await db.select({ name: castaways.name })
            .from(castaways)
            .where(eq(castaways.tribe, searchParams.get("tribe")));
        return NextResponse.json(res);
    }
}
