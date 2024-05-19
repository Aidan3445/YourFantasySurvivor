import { AdvantageStat } from "~/app/api/episodes/stats";

interface AdvantagesTableProps {
    advantages: AdvantageStat[];
}

export default function AdvantagesTable(props: AdvantagesTableProps) {
    const { advantages } = props;

    return (
        <section className="rounded-lg border-2 border-black border-collapse flex-1 m-1">
            <h3 className="text-xl font-semibold border-b-2 border-black indent-1">Advantages</h3>
            <Table advantages={advantages} />
        </section>
    );
}

function Table(props: AdvantagesTableProps) {
    const { advantages } = props;

    if (advantages.length === 0) {
        return <h2 className="text-lg text-center">No advantages in this season.</h2>;
    }

    return (
        <figure className="flex overflow-y-auto flex-col divide-y divide-y-1 max-h-40" id="advTable">
            {advantages.map((adv, index) => (
                <span key={index} className={`grid grid-cols-4 text-center divide-x-1 border-black text-xs lg:text-sm`}>
                    <h3 className="col-span-2 px-1 font-medium border-black text-md truncate">{adv.castaway}</h3>
                    <h4 className="font-normal border-black border-solid border-x">{adv.name}</h4>
                    <h4 className="font-normal border-black border-solid">{adv.status}</h4>
                </span>
            ))}
        </figure>
    );
}
