"use client";
import { useEffect, useState } from "react";
import CardContainer from "~/app/_components/cardContainer";
import SelectSeason from "~/app/_components/stats/selectSeason";
import { type Events } from "~/app/api/seasons/[name]/events/query";
import compileScores from "~/app/api/seasons/[name]/events/scores";
import { type BaseEventRules } from "~/server/db/schema/leagues";

interface LeaderboardProps {
    rules: BaseEventRules;
}

export function Leaderboard({ rules }: LeaderboardProps) {
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

    const sortedScores = Object.entries(scores).map(([name, score]) => ({
        name,
        score: score.reduce((a, b) => a + b, 0),
    })).sort((a, b) => b.score - a.score);

    return (
        <CardContainer className="justify-center items-center">
            <h3 className="text-2xl">Leaderboard</h3>
            <SelectSeason seasons={seasons} season={season} setSeason={setSeason} />
            {sortedScores.map(({ name, score }, index) => (
                <div key={name} className="flex justify-between w-1/2">
                    <span>{index + 1}</span>
                    <span>{name}</span>
                    <span>{score}</span>
                </div>
            ))}
        </CardContainer>
    );
}
