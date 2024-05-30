import { HoverCard, HoverCardArrow, HoverCardContent, HoverCardPortal, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { type EliminationStat } from "~/app/api/seasons/[name]/events/stats";

type EliminationsTableProps = {
    eliminations: EliminationStat[];
}

export default function EliminationsTable({ eliminations }: EliminationsTableProps) {
    if (eliminations.length === 0) {
        return <h2 className="text-lg text-center">No eliminations in this season.</h2>;
    }

    return (
        <figure className="flex overflow-y-auto flex-col divide-y divide-y-1 max-h-40" id="elimTable">
            {eliminations.map((elim, index) => (
                <span key={index} className={`grid grid-cols-3 text-center border-black text-xs lg:text-sm`}>
                    <h3 className="px-1 font-medium  text-md truncate">Episode {elim.episode}</h3>
                    <h4 className="font-normal border-black border-solid border-x">{elim.name}</h4>
                    <HoverCard openDelay={100} closeDelay={0}>
                        <HoverCardTrigger>
                            <h4 className="font-normal">{elim.votes.length} votes</h4>
                        </HoverCardTrigger>
                        <HoverCardPortal>
                            <HoverCardContent className="rounded border border-black bg-b2 w-50 text-nowrap shadow-md shadow-zinc-700" side="top">
                                <HoverCardArrow />
                                <div className="flex flex-col gap-1 p-1 text-sm">
                                    Votes:
                                    <br />
                                    {elim.votes.join(", ")}
                                </div>
                            </HoverCardContent>
                        </HoverCardPortal>
                    </HoverCard>

                </span>
            ))}
        </figure>
    );
}

