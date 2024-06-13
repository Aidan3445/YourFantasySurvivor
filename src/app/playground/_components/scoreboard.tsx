import { getMouseEvents } from "./scoreChart";

interface ScoresProps {
    data: {
        name: string;
        color: string;
        score: number;
        episodeScores: number[]
    }[];
}

export default function Scores({ data }: ScoresProps) {
    if (!data.length) {
        data = Array<typeof data[number]>(18).fill({
            name: "Loading...",
            color: "hsl(0, 0%, 0%)]",
            score: 0,
            episodeScores: [0]
        }, 0, 18);
    }

    return (
        <figure className="gap-0 border rounded-lg border-black overflow-hidden">
            {data.map(({ name, color, score }, index) => (
                <div key={index} className={`grid px-2 grid-cols-3 ${index & 1 ? "bg-white/20" : "bg-white/10"}`}>
                    <h3>{index + 1}</h3>
                    <h3 id={`score-${name}`}
                        className="font-semibold text-nowrap cursor-pointer"
                        style={{ color: color }}
                        {...getMouseEvents(name, color)}>
                        {name}
                    </h3>
                    <h3 className="text-right">{score}</h3>
                </div>
            ))
            }
        </figure >
    );
}

