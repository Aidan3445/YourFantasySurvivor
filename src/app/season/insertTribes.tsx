import { db } from "~/server/db";
import { Button } from "../_components/commonUI/button";
import { basicGet } from "../api/fetchFunctions";
import { seasons } from "~/server/db/schema/seasons";
import { tribes, type Tribe } from "~/server/db/schema/tribes";

export default async function InsertTribes() {
    return (
        <div>
            <br />
            <form action={async () => {
                "use server";

                const data = await db.select({ id: seasons.id, name: seasons.name }).from(seasons);
                await insert(data);
            }}>
                <Button type="submit" className="p-2 rounded-md border border-black bg-b3 hover:bg-b4">
                    Insert Tribes
                </Button>
            </form>
        </div>
    );
}

async function insert(data: { id: number, name: string }[]) {
    // eslint-disable-next-line prefer-const
    for (let { id, name } of data) {
        name = name.replace("Survivor", "Season");
        const url = new URL(`https://fantasyapi-zzxp.onrender.com/api/${name}/tribes`);
        const fetchTribes: Tribe[] = await basicGet(url);
        const newTribes = fetchTribes.map((tribe) => {
            tribe.season = id;
            return tribe;
        });

        console.log(newTribes);

        const newEntries = await db.insert(tribes).values(newTribes).returning({ id: tribes.id, name: tribes.name }).onConflictDoNothing();
        console.log(newEntries);
    }
}

