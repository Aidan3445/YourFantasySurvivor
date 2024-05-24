import { db } from "~/server/db";
import { Button } from "../_components/commonUI/button";
import { basicGet } from "../api/fetchFunctions";
import { castaways, tribes, seasons, episodes, Episode, NoteModel } from "~/server/db/schema";
import { eq } from "drizzle-orm";
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
        const fetchEpisodes: any[] = await basicGet(url);
        const newEpisodes = await Promise.all(fetchEpisodes.map(async (episode) => {
            const newEp: Episode = {
                season: id,
                number: episode.number,
                title: episode.title,
                airDate: episode.airDate,
                merge: episode.merged,
            } as Episode;
            newEp.e_advFound = await basicMap(episode.advsFound);
            newEp.e_advPlay = await basicMap(episode.advPlaysSelf);
            newEp.e_advPlay.push(...await basicMap(episode.advPlaysOther));
            newEp.e_badAdvPlay = await basicMap(episode.badAdvPlays);
            newEp.e_advElim = await basicMap(episode.advsEliminated);
            newEp.e_indivWin = await basicMap(episode.indivWins);
            newEp.e_indivReward = await basicMap(episode.indivRewards);
            newEp.e_finalists = await basicMap(episode.finalThree);
            newEp.e_fireWin = await basicMap(episode.fireWins);
            newEp.e_soleSurvivor = await basicMap(episode.soleSurvivor);
            newEp.e_elim = await basicMap(episode.eliminated);
            newEp.e_tribeUpdate = await Promise.all(episode.tribeUpdates.map(async (update: { tribe: { name: string }, survivors: { name: string }[] }) => {
                const tribeId = (await db.select({ id: tribes.id }).from(tribes).where(eq(tribes.name, update.tribe.name)))[0]?.id ?? 0;
                const castawayids = await Promise.all(update.survivors.map(async (survivor) => {
                    return (await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, survivor.name)))[0]?.id ?? 0;
                }));
                return {
                    castawayIDs: castawayids,
                    tribeIDs: [tribeId],
                    keywords: [],
                    notes: []
                };
            }));
            newEp.e_tribe1st = [];
            await Promise.all(episode.tribe1sts.map(async (tribe1st: { name: { name: string }, onModel: "Tribes" | "Survivors" }) => {
                if (tribe1st.onModel === "Tribes") {
                    const tribeId = (await db.select({ id: tribes.id }).from(tribes).where(eq(tribes.name, tribe1st.name.name)))[0]?.id ?? 0;
                    newEp.e_tribe1st?.push({
                        castawayIDs: [],
                        tribeIDs: [tribeId],
                        keywords: [],
                        notes: []
                    });
                } else {
                    if (newEp.e_tribe1st?.length === 0) {
                        newEp.e_tribe1st = [{
                            castawayIDs: [],
                            tribeIDs: [],
                            keywords: [],
                            notes: []
                        }];
                    }
                    newEp.e_tribe1st[0]?.castawayIDs.push((await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, tribe1st.name.name)))[0]?.id ?? 0);
                }
            }));
            newEp.e_tribe2nd = [];
            await Promise.all(episode.tribe2nds.map(async (tribe2nd: { name: { name: string }, onModel: "Tribes" | "Survivors" }) => {
                if (tribe2nd.onModel === "Tribes") {
                    const tribeId = (await db.select({ id: tribes.id }).from(tribes).where(eq(tribes.name, tribe2nd.name.name)))[0]?.id ?? 0;
                    newEp.e_tribe2nd?.push({
                        castawayIDs: [],
                        tribeIDs: [tribeId],
                        keywords: [],
                        notes: []
                    });
                } else {
                    if (newEp.e_tribe2nd?.length === 0) {
                        newEp.e_tribe2nd = [{
                            castawayIDs: [],
                            tribeIDs: [],
                            keywords: [],
                            notes: []
                        }];
                    }
                    newEp.e_tribe2nd[0]?.castawayIDs.push((await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, tribe2nd.name.name)))[0]?.id ?? 0);
                }
            }));

            console.log(newEp, "\n");
            const newEntries = await db.insert(episodes).values(newEp).returning({ id: episodes.id, number: episodes.number }).onConflictDoNothing();
            console.log(newEntries);
        }));
    }
}

async function basicMap(list: { name: string }[]): Promise<NoteModel[]> {
    return await Promise.all(list.map(async (item) => {
        const castawayIds = [(await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, item.name)))[0]?.id ?? 0];
        return {
            castawayIDs: castawayIds,
            tribeIDs: [],
            keywords: [],
            notes: []
        };
    }))
};
