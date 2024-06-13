"use client";
import { useEffect, useState } from "react";
import CardContainer from "~/app/_components/cardContainer";
import SelectSeason from "~/app/_components/stats/selectSeason";
import { type Events } from "~/app/api/seasons/[name]/events/query";
import compileScores from "~/app/api/seasons/[name]/events/scores";
import { cn } from "~/lib/utils";
import { type BaseEventRules } from "~/server/db/schema/leagues";
import Chart from "./scoreChart";
import Scores from "./scoreboard";

interface LeaderboardProps {
    rules: BaseEventRules;
    className?: string;
}

export function Leaderboard({ rules, className }: LeaderboardProps) {
    const [seasons, setSeasons] = useState<string[]>([]);
    const [season, setSeason] = useState<string>("");
    const [scores, setScores] = useState<Record<string, number[]>>({});

    useEffect(() => {
        fetch("/api/seasons")
            .then((res) => res.json())
            .then((data: string[]) => {
                setSeasons(data)
                setSeason(data[0] ?? "");
            })
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        if (season) {
            fetch(`/api/seasons/${season}/events`)
                .then((res) => res.json())
                .then((events: Events) => setScores(compileScores(events, rules)))
                .catch((err) => console.error(err));
        }
    }, [season, rules]);

    const sortedScores = Object.entries(scores).map(([name, score]) => {
        const episodeScores = score.reduce((totals, score, index) => {
            // pop last score from totals
            const last = totals.pop() ?? 0;
            // repeat last until scoring index reached
            for (let i = totals.length; i < index; i++) {
                totals.push(last);
            }
            // add current score to totals
            totals.push(last + score);
            return totals;
        }, [] as number[]);

        return {
            name,
            color: "hsl(0,100%,50%)",
            score: episodeScores[episodeScores.length - 1] ?? 0,
            episodeScores
        }
    }).sort((a, b) => b.score - a.score);

    sortedScores.forEach((score, index) => {
        score.color = `hsl(${300 * index / sortedScores.length}, ${index & 1 ? "50%" : "80%"}, 30%)`;
    });

    return (
        <CardContainer className={cn("justify-start items-center p-4", className)}>
            <h3 className="text-2xl">Leaderboard</h3>
            <SelectSeason seasons={seasons} season={season} setSeason={setSeason} />
            <span className="grid grid-cols-4 gap-2 w-full">
                <Scores data={sortedScores} />
                <Chart data={sortedScores} />
            </span >
        </CardContainer >
    );
}


