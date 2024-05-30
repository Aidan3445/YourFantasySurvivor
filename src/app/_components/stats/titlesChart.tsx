import { type TitleStat } from '~/app/api/seasons/[name]/events/stats';

interface TitlesChartProps {
    titles: TitleStat[];
}

export default function TitlesChart({ titles }: TitlesChartProps) {
    if (titles.length === 0) {
        return <h2 className="text-lg text-center">No titles in this season.</h2>;
    }

    return (
        <figure className="flex flex-col divide-y divide-y-1 overflow-y-auto max-h-40" id="titlesChart">
            {titles.map((title, index) => (
                <span key={index} className="grid grid-cols-3  text-center divide-x-1 border-black text-xs lg:text-sm">
                    <h3 className="col-span-2 px-1 font-medium border-black text-md truncate">{title.name}</h3>
                    <h4 className="font-normal border-black border-solid border-x">{title.count}</h4>
                </span>
            ))}
        </figure>
    );
}
