import { AdvantageStat } from "~/app/api/episodes/stats";

type AdvantagesTableProps = {
    advantages: AdvantageStat[];
}

export default function AdvantagesTable(props: AdvantagesTableProps) {
    const { advantages } = props;

    return (
        <section className="rounded-lg border-2 border-black border-collapse">
            <h3 className="text-xl font-semibold border-b-2 border-black indent-1">Advantages</h3>
            <Table advantages={advantages} />
        </section>
    );
}

function Table(props: AdvantagesTableProps) {
    const { advantages } = props;

    if (advantages.length === 0) {
        return <h2 className="text-lg text-center">No advantages found</h2>;
    }

    return (
        <figure className="flex overflow-y-auto flex-col max-h-32" id="advTable">
            {advantages.map((adv, index) => (
                <span key={index} className={`grid grid-cols-4 text-center ${index > 0 ? "border-t" : ""} border-black text-sm`}>
                    <h3 className="col-span-2 px-1 font-medium border-black text-md truncate">{adv.castaway}</h3>
                    <h4 className="font-normal border-black border-solid border-x">{adv.name}</h4>
                    <h4 className="font-normal border-black border-solid">{adv.status}</h4>
                </span>
            ))}
        </figure>
    );
}
