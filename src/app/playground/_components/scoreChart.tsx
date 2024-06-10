interface ScoreChartProps {
    data: {
        name: string;
        episodeScores: number[];
    }[];
}

export default function ScoreChart({ data }: ScoreChartProps) {
    return (
        <figure className="border rounded-lg border-black col-span-2">
        </figure>
    );
}
