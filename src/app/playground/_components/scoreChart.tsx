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
    const getTicks = (data: ScoreChartProps["data"]) => {
        // we want ticks evenly spaced between the min and max values
        // as well as always a tick at zero
        const allScores = data.flatMap((d) => d.episodeScores);
        const min = Math.min(...allScores);
        const max = Math.max(...allScores);
        const tickCount = 5;
        const tickInterval = Math.floor((max - min) / tickCount);
        const ticks = Array.from({ length: tickCount + 1 }, (_, i) => min - 1 + i * tickInterval);

        // insert zero if it's not already in the ticks must be in order
        if (!ticks.includes(0)) {
            const index = ticks.findIndex((tick) => tick > 0);
            ticks.splice(index, 0, 0);
        }
        return ticks;
    }

    // sort the data so that the end of a line is always visible for hover purposes
    const sortedData = [...data].sort((a, b) => b.episodeScores.length - a.episodeScores.length);

    return (
        <div className="w-full h-full bg-b4/50 border rounded-lg border-black col-span-3">
            <ResponsiveContainer>
                <LineChart
                    id="score-chart"
                    data={formatData({ data })}
                    margin={{
                        top: 10,
                        right: 10,
                        left: -20,
                        bottom: 0,
                    }}>
                    <CartesianGrid stroke="#4D4D4D" />
                    <XAxis dataKey="episode" type="category" stroke="black" />
                    <YAxis stroke="black" ticks={getTicks(data)}
                        domain={[
                            (dataMin: number) => (dataMin),
                            (dataMax: number) => (dataMax + 1)]} />
                    <Tooltip content={<CustomTooltip />} />
                    {sortedData.map((line, index) => (
                        <Line
                            className="cursor-pointer"
                            id={`line-${line.name}`}
                            name={`line-${index}`}
                            type="monotone"
                            dataKey={line.name}
                            stroke={line.color}
                            strokeWidth={5}
                            strokeLinecap="round"
                            strokeOpacity={0.7}
                            dot={false}
                            key={index}
                            {...getMouseEvents(line.name, line.color)}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div >
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

        data.episodeScores.forEach((value, episodeNumber) => {
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
                            <span id={`tooltip-${p.dataKey}`}> {p.dataKey}: </span>
                            <span>{p.value}</span>
                        </span>
                    ))}
                </div>
                {secondSet.length > 0 && (
                    <div className="col-start-2 border-l border-black pl-2">
                        {secondSet.map((p) => (
                            <span key={p.dataKey} className="flex gap-2 justify-between"
                                style={{ color: p.stroke, stroke: "black" }}>
                                <span id={`tooltip-${p.dataKey}`}> {p.dataKey}: </span>
                                <span>{p.value}</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export function getMouseEvents(name: string, color: string) {
    return {
        onMouseOver: () => {
            try {
                // update line style
                const lineEl = document.getElementById(`line-${name}`)!;
                lineEl.style.strokeWidth = "10";
                lineEl.style.strokeOpacity = "1";
                lineEl.style.stroke = "black";
                // update scoreboard name style
                const scoreEl = document.getElementById(`score-${name}`)!;
                scoreEl.style.color = "black";
                // update tooltip name style
                const tooltipEl = document.getElementById(`tooltip-${name}`)!;
                tooltipEl.style.color = "black";
            } catch (e) {
                if (!(e instanceof TypeError)) {
                    throw e;
                }
            }
        },
        onMouseOut: () => {
            try {
                // reset line style
                const lineEl = document.getElementById(`line-${name}`)!;
                lineEl.style.strokeWidth = "6";
                lineEl.style.strokeOpacity = "0.7";
                lineEl.style.stroke = color;
                // reset scoreboard name style
                const scoreEl = document.getElementById(`score-${name}`)!;
                scoreEl.style.color = color;
                // reset tooltip name style
                const tooltipEl = document.getElementById(`tooltip-${name}`)!;
                tooltipEl.style.color = color;
            } catch (e) {
                if (!(e instanceof TypeError)) {
                    throw e;
                }
            }
        },
    };
}

