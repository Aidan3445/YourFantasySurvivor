import { type NextRequest, NextResponse } from "next/server";
import { getCastawayEvents } from "./query";

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
    const seasonName = params.name;
    const searchParams = req.nextUrl.searchParams;
    const castawayName = searchParams.get("name");

    const castawayEvents = await getCastawayEvents(seasonName, castawayName);
    return NextResponse.json(castawayEvents);
}

