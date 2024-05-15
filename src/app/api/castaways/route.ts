import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { castaways } from "~/server/db/schema";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;

    if (!searchParams.has("tribe") && !searchParams.has("name")) {
        // either get all castaways if no tribe or name is provided
        const res = await db.select({ name: castaways.name }).from(castaways);
        return Response.json(res);
    } else if (searchParams.has("name")) {
        // or get a specific castaway by their name
        const res = await db.select()
            .from(castaways)
            .where(eq(castaways.name, searchParams.get("name")));
        return Response.json(res);
    } else {
        const res = await db.select({ name: castaways.name })
            .from(castaways)
            .where(eq(castaways.tribe, searchParams.get("tribe")));
        return Response.json(res);
    }
}
