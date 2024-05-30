import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { seasons } from "~/server/db/schema/seasons";

export async function GET(): Promise<NextResponse> {
    const seasonNames: string[] = (await db
        .select({ name: seasons.name })
        .from(seasons)
        .orderBy(desc(seasons.premierDate))).map((season) => season.name);

    return NextResponse.json<string[]>(seasonNames, { status: 200 });
}
