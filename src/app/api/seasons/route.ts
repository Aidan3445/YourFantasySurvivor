import "server-only";
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "~/server/db";
import { seasons } from "~/server/db/schema";

export async function GET() {
    const res = await db.select({ name: seasons.name }).from(seasons).orderBy(desc(seasons.premierDate));

    if (!res) {
        return { status: 404, json: { message: "Seasons not found" } };
    }

    // Return list of season names
    return NextResponse.json(res.map((s) => s.name));
}
