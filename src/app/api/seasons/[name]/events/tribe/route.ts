import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { getTribeEvents, getTribeUpdates } from "./query";

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
    const seasonName = params.name;
    const searchParams = req.nextUrl.searchParams;
    const tribeName = searchParams.get("name");

    const tribeEventData = getTribeEvents(seasonName, tribeName);
    const tribeUpdateData = getTribeUpdates(seasonName, tribeName);

    const [tribeEvents, tribeUpdates] = await Promise.all([tribeEventData, tribeUpdateData]);

    return NextResponse.json({ events: tribeEvents, updates: tribeUpdates });
}
