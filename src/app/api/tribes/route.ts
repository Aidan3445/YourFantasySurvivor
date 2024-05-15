import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { tribes } from "~/server/db/schema";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;

    if (!searchParams.has("season") && !searchParams.has("name")) {
        // either get all tribes if no season or name is provided
        const res = await db.select({ name: tribes.name }).from(tribes);
        return Response.json(res);
    } else if (searchParams.has("name")) {
        // or get a specific tribe by their name
        const res = await db.select()
            .from(tribes)
            .where(eq(tribes.name, searchParams.get("name")));
        return Response.json(res);
    } else {
        const res = await db.select({ name: tribes.name })
            .from(tribes)
            .where(eq(tribes.season, searchParams.get("season")));
        return Response.json(res);
    }
}
