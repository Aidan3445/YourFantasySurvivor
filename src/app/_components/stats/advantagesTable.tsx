import { type AdvantageStat } from "~/app/api/seasons/[name]/events/stats";

interface AdvantagesTableProps {
    advantages: AdvantageStat[];
}

export default function AdvantagesTable({ advantages }: AdvantagesTableProps) {
    if (advantages.length === 0) {
        return <h2 className="text-lg text-center">No advantages yet in this season.</h2>;
    }

    return (
        <figure className="flex overflow-y-auto overscroll-contain flex-col max-h-40 divide-y divide-black stats-scroll">
            {advantages.map((adv, index) => (
                <span key={index} className="grid grid-cols-4 text-center divide-x divide-black text-xs lg:text-sm border-r border-black">
                    <h3 className="col-span-2 px-1 font-medium text-md truncate">{adv.name}</h3>
                    <h4 className="font-normal">{adv.advName}</h4>
                    <h4 className="font-normal">{adv.status}</h4>
                </span>
            ))}
        </figure>
    );
}
