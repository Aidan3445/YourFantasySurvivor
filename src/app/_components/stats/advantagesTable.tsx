import { type AdvantageStat } from "~/app/api/seasons/[name]/events/stats";

interface AdvantagesTableProps {
    advantages: AdvantageStat[];
}

export default function AdvantagesTable({ advantages }: AdvantagesTableProps) {
    if (advantages.length === 0) {
        return <h2 className="text-lg text-center">No advantages yet in this season.</h2>;
    }

    return (
        <figure className="flex overflow-y-auto flex-col divide-y divide-y-1 max-h-40" id="advTable">
            {advantages.map((adv, index) => (
                <span key={index} className={`grid grid-cols-4 text-center divide-x-1 border-black text-xs lg:text-sm`}>
                    <h3 className="col-span-2 px-1 font-medium border-black text-md truncate">{adv.name}</h3>
                    <h4 className="font-normal border-black border-solid border-x">{adv.name}</h4>
                    <h4 className="font-normal border-black border-solid">{adv.status}</h4>
                </span>
            ))}
        </figure>
    );
}
