"use client";

import compileStats, { SeasonStats as SS, emptyStats } from "~/app/api/episodes/stats";
import { useEffect, useState } from "react";
import ChallengesPodium from "./challengesPodium";
import AdvantagesTable from "./advantagesTable";
import SelectSeason from "../selectSeason";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../commonUI/carousel";

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
                    <CarouselItem>
                        <ChallengesPodium challenges={stats.challenges} />
                    </CarouselItem>
                    <CarouselItem>
                        <AdvantagesTable advantages={stats.advantages} />
                    </CarouselItem>
                    <CarouselItem>
                        Eliminations
                    </CarouselItem>
                    <CarouselItem>
                        Other
                    </CarouselItem>
                </CarouselContent>
            </Carousel>
            <div className="bl-corner" />
            <div className="br-corner" />
        </article>
    );
}
