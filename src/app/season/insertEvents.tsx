import { db } from "~/server/db";
import { basicGet } from "../api/fetchFunctions";
import { Button } from "../_components/commonUI/button";
import { seasons } from "~/server/db/schema/seasons";
import { tribes } from "~/server/db/schema/tribes";
import { castaways } from "~/server/db/schema/castaways";
import { episodes } from "~/server/db/schema/episodes";
import { baseEvents, baseEventCastaways, baseEventTribes } from "~/server/db/schema/episodes";
import { and, eq } from "drizzle-orm";

export default async function InsertEvents() {
    return (
        <div>
            <br />
            <form action={async () => {
                "use server";

                const data = await db.select({ id: seasons.id, name: seasons.name }).from(seasons);
                await insert(data);
            }}>
                <Button type="submit" className="p-2 rounded-md border border-black bg-b3 hover:bg-b4">
                    Insert Events
                </Button>
            </form>
        </div>
    );
}

type FetchedEpisode = {
    number: number,
    advsFound: { name: string }[],
    advPlaysSelf: { name: string }[],
    advPlaysOther: { name: string }[],
    badAdvPlays: { name: string }[],
    advsEliminated: { name: string }[],
    spokeEpTitle: { name: string }[],
    tribe1sts: { name: { name: string }, onModel: "Tribes" | "Survivors" }[],
    tribe2nds: { name: { name: string }, onModel: "Tribes" | "Survivors" }[],
    indivWins: { name: string }[],
    indivRewards: { name: string }[],
    finalThree: { name: string }[],
    fireWins: { name: string }[],
    soleSurvivor: { name: string }[],
    eliminated: { name: string }[],
    tribeUpdates: { tribe: { name: string }, survivors: { name: string }[] }[],
};

type EventInsert = typeof baseEvents.$inferInsert;
type CastawayInsert = typeof baseEventCastaways.$inferInsert;
type TribeInsert = typeof baseEventTribes.$inferInsert;

async function insert(data: { id: number, name: string }[]) {
    // eslint-disable-next-line prefer-const
    for (let { id, name } of data) {
        name = name.replace("Survivor", "Season");
        const url = new URL(`https://fantasyapi-zzxp.onrender.com/api/${name}/episodes`);
        const fetchEpisodes: FetchedEpisode[] = await basicGet(url);
        await Promise.all(fetchEpisodes.map(async (episode) => {
            // get the episode from the current db that matches the old db episode via season and number
            const ep = await db.select({ id: episodes.id }).from(episodes).where(and(eq(episodes.season, id), eq(episodes.number, episode.number)));

            // go through each event in the episode and insert a new event into the baseEvents table
            await Promise.all(episode.advsFound.map(async ({ name }) => {
                const newEvent: EventInsert = {
                    episode: ep[0]?.id ?? 0,
                    name: "advFound",
                    keywords: ["idol"],
                    notes: ["found it in a bush"]
                };
                const newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });

                const castawayId = (await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, name)))[0]?.id ?? 0;

                const newEventCastaway = {
                    event: newEventId[0]?.id,
                    castaway: castawayId
                } as CastawayInsert;

                await db.insert(baseEventCastaways).values(newEventCastaway);

            }));

            await Promise.all(episode.advPlaysSelf.map(async ({ name }) => {
                const newEvent: EventInsert = {
                    episode: ep[0]?.id ?? 0,
                    name: "advPlay",
                    keywords: ["idol"],
                    notes: ["played it on themselves"]
                };
                const newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });

                const castawayId = (await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, name)))[0]?.id ?? 0;

                const newEventCastaway = {
                    event: newEventId[0]?.id,
                    castaway: castawayId
                } as CastawayInsert;

                await db.insert(baseEventCastaways).values(newEventCastaway);
            }));

            await Promise.all(episode.advPlaysOther.map(async ({ name }) => {
                const newEvent: EventInsert = {
                    episode: ep[0]?.id ?? 0,
                    name: "advPlay",
                    keywords: ["idol"],
                    notes: ["played it on someone else"]
                };
                const newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });

                const castawayId = (await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, name)))[0]?.id ?? 0;

                const newEventCastaway = {
                    event: newEventId[0]?.id,
                    castaway: castawayId
                } as CastawayInsert;

                await db.insert(baseEventCastaways).values(newEventCastaway);
            }));

            await Promise.all(episode.badAdvPlays.map(async ({ name }) => {
                const newEvent: EventInsert = {
                    episode: ep[0]?.id ?? 0,
                    name: "badAdvPlay",
                    keywords: ["idol"],
                    notes: ["played it wrong"]
                };
                const newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });

                const castawayId = (await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, name)))[0]?.id ?? 0;

                const newEventCastaway = {
                    event: newEventId[0]?.id,
                    castaway: castawayId
                } as CastawayInsert;

                await db.insert(baseEventCastaways).values(newEventCastaway);
            }));

            await Promise.all(episode.advsEliminated.map(async ({ name }) => {
                const newEvent: EventInsert = {
                    episode: ep[0]?.id ?? 0,
                    name: "advElim",
                    keywords: ["idol"],
                    notes: ["eliminated with idol"]
                };
                const newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });

                const castawayId = (await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, name)))[0]?.id ?? 0;

                const newEventCastaway = {
                    event: newEventId[0]?.id,
                    castaway: castawayId
                } as CastawayInsert;

                await db.insert(baseEventCastaways).values(newEventCastaway);
            }));

            let newEvent: EventInsert = {
                episode: ep[0]?.id ?? 0,
                name: "spokeEpTitle",
                keywords: [],
                notes: []
            };
            let newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });
            await Promise.all(episode.spokeEpTitle.map(async ({ name }) => {
                const castawayId = (await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, name)))[0]?.id ?? 0;

                const newEventCastaway = {
                    event: newEventId[0]?.id,
                    castaway: castawayId
                } as CastawayInsert;

                await db.insert(baseEventCastaways).values(newEventCastaway);
            }));

            const tribeTribe1st = episode.tribe1sts.filter((tribe1st) => tribe1st.onModel === "Tribes");
            const tribeSurvivor1st = episode.tribe1sts.filter((tribe1st) => tribe1st.onModel === "Survivors");

            await Promise.all(tribeTribe1st.map(async (tribe1st: { name: { name: string }, onModel: "Tribes" | "Survivors" }) => {
                const newEvent: EventInsert = {
                    episode: ep[0]?.id ?? 0,
                    name: "tribe1st",
                    keywords: [],
                    notes: []
                };
                const newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });

                const tribeId = (await db.select({ id: tribes.id }).from(tribes).where(eq(tribes.name, tribe1st.name.name)))[0]?.id ?? 0;
                const newEventTribe = {
                    event: newEventId[0]?.id,
                    tribe: tribeId
                } as TribeInsert;
                await db.insert(baseEventTribes).values(newEventTribe);
            }));

            if (tribeSurvivor1st.length > 0) {
                const newEvent: EventInsert = {
                    episode: ep[0]?.id ?? 0,
                    name: "tribe1st",
                    keywords: [],
                    notes: []
                };
                const newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });

                await Promise.all(tribeSurvivor1st.map(async (tribe1st: { name: { name: string }, onModel: "Tribes" | "Survivors" }) => {
                    const castawayId = (await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, tribe1st.name.name)))[0]?.id ?? 0;
                    const newEventCastaway = {
                        event: newEventId[0]?.id,
                        castaway: castawayId
                    } as CastawayInsert;
                    await db.insert(baseEventCastaways).values(newEventCastaway);
                }));
            }

            const tribeTribe2nd = episode.tribe2nds.filter((tribe2nd) => tribe2nd.onModel === "Tribes");
            const tribeSurvivor2nd = episode.tribe2nds.filter((tribe2nd) => tribe2nd.onModel === "Survivors");

            await Promise.all(tribeTribe2nd.map(async (tribe2nd: { name: { name: string }, onModel: "Tribes" | "Survivors" }) => {
                const newEvent: EventInsert = {
                    episode: ep[0]?.id ?? 0,
                    name: "tribe2nd",
                    keywords: [],
                    notes: []
                };
                const newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });

                const tribeId = (await db.select({ id: tribes.id }).from(tribes).where(eq(tribes.name, tribe2nd.name.name)))[0]?.id ?? 0;
                const newEventTribe = {
                    event: newEventId[0]?.id,
                    tribe: tribeId
                } as TribeInsert;
                await db.insert(baseEventTribes).values(newEventTribe);
            }));

            if (tribeSurvivor2nd.length > 0) {
                const newEvent: EventInsert = {
                    episode: ep[0]?.id ?? 0,
                    name: "tribe2nd",
                    keywords: [],
                    notes: []
                };
                const newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });

                await Promise.all(tribeSurvivor2nd.map(async (tribe2nd: { name: { name: string }, onModel: "Tribes" | "Survivors" }) => {
                    const castawayId = (await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, tribe2nd.name.name)))[0]?.id ?? 0;
                    const newEventCastaway = {
                        event: newEventId[0]?.id,
                        castaway: castawayId
                    } as CastawayInsert;
                    await db.insert(baseEventCastaways).values(newEventCastaway);
                }));
            }

            newEvent = {
                episode: ep[0]?.id ?? 0,
                name: "indivWin",
                keywords: [],
                notes: []
            };
            newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });
            await Promise.all(episode.indivWins.map(async ({ name }) => {
                const castawayId = (await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, name)))[0]?.id ?? 0;
                const newEventCastaway = {
                    event: newEventId[0]?.id,
                    castaway: castawayId
                } as CastawayInsert;
                await db.insert(baseEventCastaways).values(newEventCastaway);
            }));

            newEvent = {
                episode: ep[0]?.id ?? 0,
                name: "indivReward",
                keywords: [],
                notes: []
            };
            newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });
            await Promise.all(episode.indivRewards.map(async ({ name }) => {
                const castawayId = (await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, name)))[0]?.id ?? 0;
                const newEventCastaway = {
                    event: newEventId[0]?.id,
                    castaway: castawayId
                } as CastawayInsert;
                await db.insert(baseEventCastaways).values(newEventCastaway);
            }));

            newEvent = {
                episode: ep[0]?.id ?? 0,
                name: "finalists",
                keywords: [],
                notes: []
            };
            newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });
            await Promise.all(episode.finalThree.map(async ({ name }) => {
                const castawayId = (await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, name)))[0]?.id ?? 0;
                const newEventCastaway = {
                    event: newEventId[0]?.id,
                    castaway: castawayId
                } as CastawayInsert;
                await db.insert(baseEventCastaways).values(newEventCastaway);
            }));

            newEvent = {
                episode: ep[0]?.id ?? 0,
                name: "fireWin",
                keywords: [],
                notes: []
            };
            newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });
            await Promise.all(episode.fireWins.map(async ({ name }) => {
                const castawayId = (await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, name)))[0]?.id ?? 0;
                const newEventCastaway = {
                    event: newEventId[0]?.id,
                    castaway: castawayId
                } as CastawayInsert;
                await db.insert(baseEventCastaways).values(newEventCastaway);
            }));

            newEvent = {
                episode: ep[0]?.id ?? 0,
                name: "soleSurvivor",
                keywords: [],
                notes: []
            };
            newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });
            await Promise.all(episode.soleSurvivor.map(async ({ name }) => {
                const castawayId = (await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, name)))[0]?.id ?? 0;
                const newEventCastaway = {
                    event: newEventId[0]?.id,
                    castaway: castawayId
                } as CastawayInsert;
                await db.insert(baseEventCastaways).values(newEventCastaway);
            }));

            newEvent = {
                episode: ep[0]?.id ?? 0,
                name: "elim",
                keywords: [],
                notes: []
            };
            newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });
            await Promise.all(episode.eliminated.map(async ({ name }) => {
                const castawayId = (await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, name)))[0]?.id ?? 0;
                const newEventCastaway = {
                    event: newEventId[0]?.id,
                    castaway: castawayId
                } as CastawayInsert;
                await db.insert(baseEventCastaways).values(newEventCastaway);
            }));

            await Promise.all(episode.tribeUpdates.map(async (update: { tribe: { name: string }, survivors: { name: string }[] }) => {
                const tribeId = (await db.select({ id: tribes.id }).from(tribes).where(eq(tribes.name, update.tribe.name)))[0]?.id ?? 0;
                const castawayids = await Promise.all(update.survivors.map(async (survivor) => {
                    return (await db.select({ id: castaways.id }).from(castaways).where(eq(castaways.name, survivor.name)))[0]?.id ?? 0;
                }));

                let keywords: string[];
                switch (episode.number) {
                    case 1:
                        keywords = ["Initial tribes"];
                        break;
                    case 7:
                        keywords = ["Merge"];
                        break;
                    default:
                        keywords = ["Tribe swap"];
                        break;
                };


                const newEvent: EventInsert = {
                    episode: ep[0]?.id ?? 0,
                    name: "tribeUpdate",
                    keywords,
                    notes: []
                };
                const newEventId = await db.insert(baseEvents).values(newEvent).returning({ id: baseEvents.id });

                const newEventTribe = {
                    event: newEventId[0]?.id,
                    tribe: tribeId
                } as TribeInsert;
                await db.insert(baseEventTribes).values(newEventTribe);

                await Promise.all(castawayids.map(async (castawayId) => {
                    const newEventCastaway = {
                        event: newEventId[0]?.id,
                        castaway: castawayId
                    } as CastawayInsert;
                    await db.insert(baseEventCastaways).values(newEventCastaway);
                }));
            }));

        }));

        console.log("Inserted events for", name);
    }
}

/*
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
*/
