import { db } from "~/server/db";
import { Button } from "../_components/commonUI/button";
import { basicGet } from "../api/fetchFunctions";
import { castaways, Castaway, seasons, Episode } from "~/server/db/schema";
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
    for (var { id, name } of data) {
        name = name.replace("Survivor", "Season");
        const url = new URL(`https://fantasyapi-zzxp.onrender.com/api/${name}/episodes`);
        const fetchEpisodes: Episode[] = await basicGet(url);
        console.log(fetchEpisodes);



        /*const newCastaways = fetchCastaways.map((castaway) => {
            castaway.season = id;
            if (castaway.photo.length > 512) {
                castaway.photo = "https://via.placeholder.com/150";
            }
            return castaway;
        });

        console.log(newCastaways);

        const newEntries = await db.insert(castaways).values(newCastaways).returning({ id: castaways.id, name: castaways.name }).onConflictDoNothing();
        console.log(newEntries);*/
    }
}

