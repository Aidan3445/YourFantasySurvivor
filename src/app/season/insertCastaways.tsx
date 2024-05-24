import { db } from "~/server/db";
import { Button } from "../_components/commonUI/button";
import { basicGet } from "../api/fetchFunctions";
import { castaways, Castaway, seasons } from "~/server/db/schema";
export default async function InsertCastaways() {
    return (
        <div>
            <br />
            <form action={async () => {
                "use server";

                const data = await db.select({ id: seasons.id, name: seasons.name }).from(seasons);
                await insert(data);
            }}>
                <Button type="submit" className="bg-b3 hover:bg-b4 border border-black rounded-md p-2">
                    Insert Castaways
                </Button>
            </form>
        </div>
    );
}

async function insert(data: { id: number, name: string }[]) {
    for (var { id, name } of data) {
        name = name.replace("Survivor", "Season");
        const url = new URL(`https://fantasyapi-zzxp.onrender.com/api/${name}/survivors`);
        const fetchCastaways: Castaway[] = await basicGet(url);
        const newCastaways = fetchCastaways.map((castaway) => {
            castaway.season = id;
            castaway.shortName = castaway.name.substring(0, 16);
            if (castaway.photo.length > 512) {
                castaway.photo = "https://via.placeholder.com/150";
            }
            return castaway;
        });

        console.log(newCastaways);

        const newEntries = await db.insert(castaways).values(newCastaways).returning({ id: castaways.id, name: castaways.shortName }).onConflictDoNothing();
        console.log(newEntries);
    }
}

