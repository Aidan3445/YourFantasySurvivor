"use client";

import compileStats, { SeasonStats as SS, emptyStats } from "~/app/api/episodes/stats";
import { useEffect, useState } from "react";
import ChallengesPodium from "./challengesPodium";
import AdvantagesTable from "./advantagesTable";
import SelectSeason from "../selectSeason";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../commonUI/tabs";


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
        <article className="flex flex-col gap-2 p-1 w-full text-black rounded-xl border-2 border-black ring-4 outline-black corner-frame outline outline-4 outline-offset-4 bg-b4/40 ring-b1">
            <div className="tl-corner" />
            <div className="tr-corner" />
            <SelectSeason seasons={seasons} season={season} setSeason={setSeason} />
            <Tabs defaultValue="tab1">
                <TabsList>
                    <TabsTrigger value="tab1">Challenges {"&"} Advantages</TabsTrigger>
                    <TabsTrigger value="tab2">Other Stats</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">
                    <ChallengesPodium challenges={stats.challenges} />
                    <AdvantagesTable advantages={stats.advantages} />
                </TabsContent>
                <TabsContent value="tab2">
                    hello
                </TabsContent>
            </Tabs>
            <div className="bl-corner" />
            <div className="br-corner" />
        </article>
    );
}
