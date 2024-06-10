import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/app/_components/commonUI/select";

interface SelectSeasonProps {
    seasons: string[];
    season: string;
    setSeason: (season: string) => void;
};

export default function SelectSeason({ seasons, season, setSeason }: SelectSeasonProps) {

    return (
        <Select defaultValue={season} value={season} onValueChange={setSeason}>
            <SelectTrigger className="self-center m-2 w-3/4 font-semibold hs-in">
                <br />
                <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-black bg-b4">
                {seasons.map((s) => <SelectItem className="hover:bg-b3" key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
        </Select >
    );
}
