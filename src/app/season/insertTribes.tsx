import { db } from "~/server/db";
import { Button } from "../_components/commonUI/button";
import { basicGet } from "../api/fetchFunctions";
import { seasons, Tribe, tribes } from "~/server/db/schema";
export default async function InsertTribes() {
    return (
        <div>
            <br />
            <form action={async () => {
                "use server";

                const data = await db.select({ id: seasons.id, name: seasons.name }).from(seasons);
                await insert(data);
            }}>
                <Button type="submit" className="bg-b3 hover:bg-b4 border border-black rounded-md p-2">
                    Insert Tribes                </Button>
            </form>
        </div>
    );
}

async function insert(data: { id: number, name: string }[]) {
    for (var { id, name } of data) {
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

