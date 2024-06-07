import { NextResponse } from "next/server";
import { getSeasons } from "./query";

export async function GET() {
    const seasonNames = await getSeasons();

    return NextResponse.json<string[]>(seasonNames, { status: 200 });
}
