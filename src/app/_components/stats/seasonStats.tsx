"use client";

import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../commonUI/carousel";
import compileStats, { SeasonStats as SS, emptyStats } from "~/app/api/episodes/stats";
import ChallengesPodium from "./challengesPodium";
import AdvantagesTable from "./advantagesTable";
import SelectSeason from "./selectSeason";
import EliminationsTable from "./eliminationsTable";
import TitlesChart from "./titlesChart";
import FinalsStats from "./finalsStats";
import StatsSection from "./statsSection";

interface SeasonStatsProps {
    seasons: string[];
}

export default function SeasonStats({ seasons }: SeasonStatsProps) {
    const [season, setSeason] = useState<string>(seasons[0] ?? "");
    const [stats, setStats] = useState<SS>(emptyStats());

    // when season is set, fetch episodes and compile stats
    useEffect(() => {
        if (season) {
            fetch(`/api/episodes?season=${season}`)
                .then((res) => res.json())
                .then((episodes) => setStats(compileStats(episodes)));
        }
    }, [season]);

    const carouselItems = [
        { title: "Challenges", content: <ChallengesPodium challenges={stats.challenges} /> },
        { title: "Advantages", content: <AdvantagesTable advantages={stats.advantages} /> },
        { title: "Eliminations", content: <EliminationsTable eliminations={stats.eliminations} /> },
        { title: "Titles", content: <TitlesChart titles={stats.titles} /> },
    ];

    return (
        <article className="flex flex-col gap-2 mx-4 sm:m-2 text-black rounded-xl border-2 border-black ring-4 outline-black corner-frame outline outline-4 outline-offset-4 bg-b4/40 ring-b1">
            <div className="tl-corner" />
            <div className="tr-corner" />
            <SelectSeason seasons={seasons} season={season} setSeason={setSeason} />
            <Carousel>
                <span className="flex justify-around pb-2">
                    <CarouselPrevious />
                    <h2 className="text-2xl font-semibold">Season Stats</h2>
                    <CarouselNext />
                </span>
                <CarouselContent>
                    {carouselItems.map((item) => (
                        <CarouselItem key={item.title} title={item.title}>
                            <StatsSection title={item.title} children={item.content} />
                        </CarouselItem>
                    ))}
                    <CarouselItem title="Finals">
                        <FinalsStats final={stats.final} fireWin={stats.fireWin} soleSurvivor={stats.soleSurvivor} />
                    </CarouselItem>
                </CarouselContent>
            </Carousel>
            <div className="bl-corner" />
            <div className="br-corner" />
        </article>
    );
}
