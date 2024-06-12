import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Separator } from "~/app/_components/commonUI/separator";

interface ScoreChartProps {
    data: {
        name: string;
        color: string;
        episodeScores: number[];
    }[];
}

export default function Chart({ data }: ScoreChartProps) {

    return (
        <div className="w-full h-full border rounded-lg border-black col-span-3">
            <ResponsiveContainer>
                <LineChart
                    data={formatData({ data })}
                    margin={{
                        top: 10,
                        right: 10,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="5 10" stroke="black" />
                    <XAxis dataKey="episode" stroke="black" />
                    <YAxis stroke="black" domain={['dataMin', 'dataMax']} tickCount={8} />
                    <Tooltip content={<CustomTooltip />} />
                    {data.map((data, index) => (
                        <Line
                            id={`line-${data.name}`}
                            type="monotone"
                            dataKey={data.name}
                            stroke={data.color}
                            strokeWidth={6}
                            strokeLinecap="round"
                            strokeOpacity={0.7}
                            dot={false}
                            key={index}
                            onMouseOver={() => {
                                const element = document.getElementById(`line-${data.name}`)!;
                                element.style.strokeWidth = "10";
                                element.style.strokeOpacity = "1";
                                element.style.stroke = "black";
                            }}
                            onMouseOut={() => {
                                const element = document.getElementById(`line-${data.name}`)!;
                                element.style.strokeWidth = "6";
                                element.style.strokeOpacity = "0.7";
                                element.style.stroke = data.color;
                            }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

type FormattedData = {
    episode: string | number;
    [key: string]: number | string;
}[];

function formatData({ data }: ScoreChartProps) {
    const formattedData: FormattedData = [{ episode: "" }];
    data.forEach((data) => {
        const ep1 = formattedData[0]!;
        ep1[data.name] = 0;

        data.episodeScores.forEach((value, episodeIndex) => {
            const episodeNumber = episodeIndex;
            if (!formattedData[episodeNumber]) {
                formattedData[episodeNumber] = {
                    episode: episodeNumber,
                };
            }
            const episode = formattedData[episodeNumber]!;
            episode[data.name] = value;
        });
    });

    return formattedData;
}

interface CustomTooltipProps {
    payload?: {
        dataKey: string;
        value: number;
        stroke: string;
    }[];
    label?: string;
}

function CustomTooltip({ payload, label }: CustomTooltipProps) {

    if (!label || !payload) return;

    payload.sort((a, b) => b.value - a.value);

    let firstSet: typeof payload, secondSet: typeof payload;

    if (payload.length > 9) {
        firstSet = payload.slice(0, payload.length / 2 + 1);
        secondSet = payload.slice(payload.length / 2);
    } else {
        firstSet = payload;
        secondSet = [];
    }

    return (
        <div className="bg-b3/80 rounded-md border-black border p-1 flex flex-col">
            <div>Episode {label}:</div>
            <Separator />
            <div className="grid gap-2">
                <div>
                    {firstSet.map((p) => (
                        <span key={p.dataKey} className="flex gap-2 justify-between"
                            style={{ color: p.stroke, stroke: "black" }}>
                            <span >
                                {p.dataKey}:
                            </span>
                            <span>{p.value}</span>
                        </span>
                    ))}
                </div>
                {secondSet.length > 0 && (
                    <div className="col-start-2 border-l border-black pl-2">
                        {secondSet.map((p) => (
                            <span key={p.dataKey} className="flex gap-2 justify-between"
                                style={{ color: p.stroke, stroke: "black" }}>
                                <span >
                                    {p.dataKey}:
                                </span>
                                <span>{p.value}</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
