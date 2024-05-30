"use client";

import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../commonUI/carousel";
import compileStats, { type SeasonStats as SS, emptyStats } from "~/app/api/seasons/[name]/events/stats";
import ChallengesPodium from "./challengesPodium";
import AdvantagesTable from "./advantagesTable";
import SelectSeason from "./selectSeason";
import EliminationsTable from "./eliminationsTable";
import TitlesChart from "./titlesChart";
import FinalsStats from "./finalsStats";
import StatsSection from "./statsSection";
import CardContainer from "../cardContainer";
import { type BaseEvent } from "~/server/db/schema/episodes";

interface SeasonStatsProps {
    seasons: string[];
}

export default function SeasonStats({ seasons }: SeasonStatsProps) {
    const [season, setSeason] = useState<string>(seasons[0] ?? "");
    const [stats, setStats] = useState<SS>(emptyStats());

    // when season is set, fetch episodes and compile stats
    useEffect(() => {
        if (season) {
            fetch(`/api/seasons/${season}/events`)
                .then((res) => res.json())
                .then((events: BaseEvent[]) => setStats(compileStats(events)))
                .catch(() => {
                    setSeason("");
                    setStats(emptyStats());
                });
        }
    }, [season]);

    const carouselItems = [
        {
            title: "Challenges", content:
                <ChallengesPodium castaways={stats.castawayChallenges} tribes={stats.tribeChallenges} />
        },
        { title: "Advantages", content: <AdvantagesTable advantages={stats.advantages} /> },
        { title: "Eliminations", content: <EliminationsTable eliminations={stats.eliminations} /> },
        { title: "Titles", content: <TitlesChart titles={stats.titles} /> },
    ];

    return (
        <CardContainer>
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
                            <StatsSection title={item.title}>
                                {item.content}
                            </StatsSection>
                        </CarouselItem>
                    ))}
                    <CarouselItem title="Finals">
                        <FinalsStats final={stats.final} fireWin={stats.fireWin} soleSurvivor={stats.soleSurvivor} />
                    </CarouselItem>
                </CarouselContent>
            </Carousel>
        </CardContainer>
    );
}
