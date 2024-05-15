import { desc } from "drizzle-orm";
import { db } from "~/server/db";
import { seasons } from "~/server/db/schema";

export async function GET() {
    const res = await db.select({ name: seasons.name }).from(seasons).orderBy(desc(seasons.premierDate));

    if (!res) {
        return { status: 404, json: { message: "Seasons not found" } };
    }

    return Response.json(res);
}
