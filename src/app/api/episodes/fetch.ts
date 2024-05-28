import { headers } from "next/headers";
import { basicGet } from "../fetchFunctions";
import { Episode } from "~/server/db/schema/episodes";

export default async function getEpisodes(season?: string) {
    const origin = headers().get("host");
    const url = new URL(`http://${origin}/api/episodes`);

    if (season) {
        url.searchParams.set("season", season);
    }

    const res = await basicGet<Episode[]>(url);
    return res;
}
