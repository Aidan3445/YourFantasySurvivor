import { NextResponse } from "next/server";
import { basicGet } from "../fetchFunctions";
import { Episode } from "~/server/db/schema";

const origin = process.env.ORIGIN;

export default async function getEpisodes(season?: string) {
    const url = new URL(`http://${origin}/api/episodes`);

    if (season) {
        url.searchParams.set("season", season);
    }

    const res = await basicGet<Episode[]>(url);
    return res;
}
