"use client";

import compileStats, { SeasonStats as SS, emptyStats } from "~/app/api/episodes/stats";
import { useEffect, useState } from "react";
import ChallengesPodium from "./challengesPodium";
import AdvantagesTable from "./advantagesTable";
import SelectSeason from "../selectSeason";


export default function SeasonStats() {
    const [seasons, setSeasons] = useState<string[]>([]);
    const [season, setSeason] = useState<string>("");
    const [stats, setStats] = useState<SS>(emptyStats());

    // fetch available seasons
    useEffect(() => {
        fetch("/api/seasons")
            .then((res) => res.json())
            .then((s) => {
                setSeasons(s);
                // set default season to first season which should be the latest
                if (s[0]) setSeason(s[0]);
            });
    }, []);

    // when season is set, fetch episodes and compile stats
    useEffect(() => {
        if (season) {
            fetch(`/api/episodes?season=${season}`)
                .then((res) => res.json())
                .then((episodes) => setStats(compileStats(episodes)));
        }
    }, [season]);

    return (
        <article className="flex flex-col w-full rounded-2xl border-4 border-black border-solid">
            <div className="flex flex-col gap-1 p-4 text-black rounded-xl border-8 border-solid shadow-inner bg-b4/80 border-b1 shadow-b2">
                <span className="flex flex-row gap-4">
                    <h2 className="m-auto text-xl font-bold">Stats:</h2>
                    <SelectSeason seasons={seasons} season={season} setSeason={setSeason} />
                </span>
                <ChallengesPodium challenges={stats.challenges} />
                <AdvantagesTable advantages={stats.advantages} />
            </div>
        </article>
    );
}
