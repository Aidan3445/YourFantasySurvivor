import { HoverCardArrow, HoverCardPortal } from "@radix-ui/react-hover-card";
import { User, Users } from "lucide-react";
import { HoverCardContent } from "~/app/_components/commonUI/hover";
import { HoverCard, HoverCardTrigger } from "~/app/_components/commonUI/hover";
import { ChallengeStat } from "~/app/api/episodes/stats";

interface ChallengesPodiumProps {
    challenges: ChallengeStat[];
}

export default function ChallengesPodium({ challenges }: ChallengesPodiumProps) {


    return (
        <figure className="grid grid-flow-col auto-cols-fr gap-1 px-1 pt-2">
            <Podium stats={challenges[1]} gradient="from-zinc-500 via-zinc-200 to-zinc-500" height="h-24" animation="animate-shimmer" />
            <Podium stats={challenges[0]} gradient="from-amber-400 from-40% via-amber-300 via-50% to-amber-400 to-60%" height="h-32" animation="animate-shimmer-delay-1" />
            <Podium stats={challenges[2]} gradient="from-amber-700 via-amber-500 to-amber-700" height="h-20" animation="animate-shimmer-delay-2" />
        </figure>
    );
}

interface PodiumProps {
    stats?: ChallengeStat;
    gradient: string;
    height: string;
    animation: string;
}

function Podium({ stats, gradient, height, animation }: PodiumProps) {

    if (!stats) {
        stats = {
            castaway: "Loading...",
            indivWin: 0,
            indivReward: 0,
            tribe1st: 0,
            tribe2nd: 0
        };
    }

    return (
        <div className="self-end text-center">
            <HoverCard openDelay={200} closeDelay={100}>
                <HoverCardTrigger>
                    <h3 className="p-0 m-0 w-full font-medium md:text-base text-sm truncate">{stats.castaway}</h3>
                    <div className={`flex flex-col ${height} gap-1 p-1 justify-center items-center 
                        rounded-t-md border-2 border-b-0 border-black border-solid bg-gradient-to-br ${gradient} text-center ${animation}`}>
                        <span className="flex gap-2 items-center">
                            <User className="bg-b4 rounded-full border border-black" />
                            <h4 className="font-medium">{stats.indivWin + stats.indivReward}</h4>
                        </span>
                        <span className="flex gap-2 items-center">
                            <Users className="bg-b4 rounded-full border border-black" />
                            <h4 className="font-medium">{stats.tribe1st + stats.tribe2nd}</h4>
                        </span>
                    </div>
                </HoverCardTrigger>
                <HoverCardPortal>
                    <HoverCardContent className="cursor-default border-black bg-b2 w-50 text-nowrap shadow-md shadow-zinc-700">
                        <HoverCardArrow />
                        <div className="grid grid-cols-3 grid-rows-2 gap-2 text-center">
                            <div className="grid grid-cols-subgrid col-span-3 items-center">
                                <h3>Tribe</h3>
                                <div className="flex flex-col">
                                    <h3 className="border-b border-black ordinal">1st</h3>
                                    <h3 className="tabular-nums">{stats.tribe1st}</h3>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="border-b border-black relative ordinal">
                                        2nd
                                        <HoverCard openDelay={100} closeDelay={0}>
                                            <HoverCardTrigger>
                                                <span className="text-xs cursor-help border-black rounded-full absolute -translate-y-1">?</span>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="bg-b2 border-black text-xs text-center shadow-md shadow-zinc-700" sideOffset={10} side="top">
                                                <HoverCardArrow className="absolute translate-x-0.25" />
                                                <p className="text-wrap normal-nums">Applies only to seasons with 3-tribe challenges</p>
                                            </HoverCardContent>
                                        </HoverCard>
                                    </h3>
                                    <h3 className="tabular-nums">{stats.tribe2nd}</h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-subgrid col-span-3 items-center">
                                <h3>Individual</h3>
                                <div className="flex flex-col">
                                    <h3 className="border-b border-black">Wins</h3>
                                    <h3 className="tabular-nums">{stats.indivWin}</h3>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="border-b border-black">Rewards</h3>
                                    <h3 className="tabular-nums">{stats.indivReward}</h3>
                                </div>
                            </div>
                        </div>
                    </HoverCardContent>
                </HoverCardPortal>
            </HoverCard>
        </div >
    );
}
