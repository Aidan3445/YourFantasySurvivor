import { type TitleStat } from '~/app/api/seasons/[name]/events/stats';

interface TitlesChartProps {
    titles: TitleStat[];
}

export default function TitlesChart({ titles }: TitlesChartProps) {
    if (titles.length === 0) {
        return <h2 className="text-lg text-center">No titles yet in this season.</h2>;
    }

    return (
        <figure className="flex overflow-y-auto flex-col max-h-40 stats-scroll">
            {titles.map((title, index) => (
                <span key={index} className={`grid grid-cols-3 text-xs text-center border-r border-black divide-x divide-black lg:text-sm ${index & 1 ? "bg-white/20" : "bg-white/10"}`}>
                    <h3 className="col-span-2 px-1 font-medium text-md">{title.name}</h3>
                    <h4 className="font-normal">{title.count}</h4>
                </span>
            ))}
        </figure>
    );
}
