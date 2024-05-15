"use client";
import { Episode } from "~/server/db/schema";
import getSeason from "~/app/api/seasons/fetch";
import getEpisodes from "~/app/api/episodes/fetch";
import compileStats from "~/app/api/episodes/stats";
import ChallengesPodium from "./challengesPodium";
import AdvantagesTable from "./advantagesTable";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../commonUI/select";

export default async function SeasonStats() {
    const seasons = await getSeason();

    if (!seasons || seasons.length === 0) {
        return <h1>Seasons not found</h1>;
    }

    const [season, setSeason] = useState(seasons[0]);

    const episodes: Episode[] = await getEpisodes(season);
    const stats = compileStats(episodes);

    return (
        <article className="flex flex-col rounded-2xl border-4 border-black border-solid">
            <div className="flex flex-col gap-1 p-4 text-black rounded-xl border-8 border-solid shadow-inner bg-b4/80 border-b1 shadow-b2">
                <span className="flex justify-between">
                    <h2 className="text-2xl font-bold">Stats:</h2>
                    <Select>
                        <SelectTrigger>{season.name}</SelectTrigger>
                        <SelectContent>
                            {seasons.map((s: { name: string }) => (
                                <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                        <ChallengesPodium challenges={stats.challenges} />
                        <AdvantagesTable advantages={stats.advantages} />
                    </Select>
                </span>
            </div>
        </article>
    );
}
