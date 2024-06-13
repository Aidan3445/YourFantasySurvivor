import { HoverCard, HoverCardArrow, HoverCardContent, HoverCardPortal, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { type EliminationStat } from "~/app/api/seasons/[name]/events/stats";

type EliminationsTableProps = {
    eliminations: EliminationStat[];
}

export default function EliminationsTable({ eliminations }: EliminationsTableProps) {
    if (eliminations.length === 0) {
        return <h2 className="text-lg text-center">No eliminations yet in this season.</h2>;
    }

    return (
        <figure className="flex overflow-y-auto flex-col max-h-40 stats-scroll">
            {eliminations.map((elim, index) => (
                <span key={index} className={`grid grid-cols-3 text-xs text-center border-r border-black divide-x divide-black lg:text-sm ${index & 1 ? "bg-white/20" : "bg-white/10"}`}>
                    <h3>Episode {elim.episode}</h3>
                    <h4 className="font-medium">{elim.name}</h4>
                    <HoverCard openDelay={100} closeDelay={0}>
                        <HoverCardTrigger>
                            <h4 >{elim.votes.length} vote{elim.votes.length > 1 ? "s" : ""}</h4>
                        </HoverCardTrigger>
                        <HoverCardPortal>
                            <HoverCardContent className="rounded border border-black shadow-md bg-b2 w-50 text-nowrap shadow-zinc-700" side="top">
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

