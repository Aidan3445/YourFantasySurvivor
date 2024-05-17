"use client";

import { useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/app/_components/commonUI/select";

type SelectSeasonProps = {
    seasons: string[];
    season: string;
    setSeason: (season: string) => void;
};

export default function SelectSeason(props: SelectSeasonProps) {
    const { seasons, season, setSeason } = props;

    useEffect(() => { }, [season]);

    return (
        <Select defaultValue={season} value={season} onValueChange={setSeason}>
            <SelectTrigger
                className="font-semibold border-black hover:border-2 hover:shadow-inner bg-b4 aria-expanded:border-2 aria-expanded:shadow-inner aria-expanded:shadow-b1 hover:shadow-b1"
                style={{ "transition": "border-width 0.1s ease-in-out" }}>
                <br />
                <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-black bg-b4">
                {seasons.map((s) => <SelectItem className="hover:bg-b3" key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
        </Select >
    );
}
