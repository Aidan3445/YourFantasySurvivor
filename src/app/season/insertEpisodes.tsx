import { db } from "~/server/db";
import { Button } from "../_components/commonUI/button";
import { basicGet } from "../api/fetchFunctions";
import { seasons } from "~/server/db/schema/seasons";
import { episodes, type Episode } from "~/server/db/schema/episodes";

export default async function InsertEpisodes() {
    return (
        <div>
            <br />
            <form action={async () => {
                "use server";

                const data = await db.select({ id: seasons.id, name: seasons.name }).from(seasons);
                await insert(data);
            }}>
                <Button type="submit" className="bg-b3 hover:bg-b4 border border-black rounded-md p-2">
                    Insert Episodes
                </Button>
            </form>
        </div>
    );
}

async function insert(data: { id: number, name: string }[]) {
    for (let { id, name } of data) {
        name = name.replace("Survivor", "Season");
        const url = new URL(`https://fantasyapi-zzxp.onrender.com/api/${name}/episodes`);
        const fetchEpisodes: Episode[] = await basicGet(url);
        const newEpisodes = fetchEpisodes.map((episode) => {
            episode.season = id;
            episode.merge = episode.merged;
            return episode;
        });

        console.log(newEpisodes);

        const newEntries = await db.insert(episodes).values(newEpisodes).returning({ id: episodes.id, number: episodes.number }).onConflictDoNothing();
        console.log(newEntries);
    }
}

