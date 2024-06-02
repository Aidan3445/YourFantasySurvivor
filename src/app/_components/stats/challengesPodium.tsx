import { HoverCardArrow, HoverCardPortal } from "@radix-ui/react-hover-card";
import { User, Users } from "lucide-react";
import { HoverCardContent } from "~/app/_components/commonUI/hover";
import { HoverCard, HoverCardTrigger } from "~/app/_components/commonUI/hover";
import { type CastawayChallengeStat, type TribeChallengeStat } from "~/app/api/seasons/[name]/events/stats";

interface ChallengesPodiumProps {
    castaways: CastawayChallengeStat[];
    tribes: TribeChallengeStat[];
}

export default function ChallengesPodium({ castaways, tribes }: ChallengesPodiumProps) {

    return (
        <figure className="grid grid-flow-col auto-cols-fr gap-1 px-1 pt-2">
            <Podium castaway={castaways[1]} tribe={tribes[1]} gradient="from-zinc-500 via-zinc-200 to-zinc-500" height="h-24" animation="animate-shimmer" />
            <Podium castaway={castaways[0]} tribe={tribes[0]} gradient="from-amber-400 from-40% via-amber-300 via-50% to-amber-400 to-60%" height="h-32" animation="animate-shimmer-delay-1" />
            <Podium castaway={castaways[2]} tribe={tribes[2]} gradient="from-amber-700 via-amber-500 to-amber-700" height="h-20" animation="animate-shimmer-delay-2" />
        </figure>
    );
}

interface PodiumProps {
    castaway: CastawayChallengeStat | undefined;
    tribe: TribeChallengeStat | undefined;
    gradient: string;
    height: string;
    animation: string;
}

function Podium({ castaway, tribe, gradient, height, animation }: PodiumProps) {

    if (!castaway && !tribe) {
        castaway = {
            name: "Loading...",
            indivWin: 0,
            indivReward: 0,
            tribe1st: 0,
            tribe2nd: 0
        };
    }

    const name = castaway?.name ?? tribe?.name;
    const indivWin = castaway?.indivWin ?? 0
    const indivReward = castaway?.indivReward ?? 0
    const tribe1st = castaway?.tribe1st ?? tribe?.tribe1st ?? 0
    const tribe2nd = castaway?.tribe2nd ?? tribe?.tribe2nd ?? 0

    return (
        <div className="self-end text-center">
            <HoverCard openDelay={200} closeDelay={100}>
                <HoverCardTrigger>
                    <h3 className="p-0 m-0 w-full text-sm font-medium md:text-base truncate">{name}</h3>
                    <div className={`flex flex-col ${height} gap-1 p-1 justify-center items-center 
                        rounded-t-md border-2 border-b-0 border-black border-solid bg-gradient-to-br ${gradient} text-center ${animation}`}>
                        {castaway &&
                            <span className="flex gap-2 items-center">
                                <User className="rounded-full border border-black bg-b4" />
                                <h4 className="font-medium">{indivWin + indivReward}</h4>
                            </span>
                        }
                        <span className="flex gap-2 items-center">
                            <Users className="rounded-full border border-black bg-b4" />
                            <h4 className="font-medium">{tribe1st + tribe2nd}</h4>
                        </span>
                    </div>
                </HoverCardTrigger>
                <HoverCardPortal>
                    <HoverCardContent className="border-black shadow-md cursor-default bg-b2 w-50 text-nowrap shadow-zinc-700">
                        <HoverCardArrow />
                        <div className="grid grid-cols-3 grid-rows-2 gap-2 text-center">
                            <div className="grid col-span-3 items-center grid-cols-subgrid">
                                <h3>Tribe</h3>
                                <div className="flex flex-col">
                                    <h3 className="ordinal border-b border-black">1st</h3>
                                    <h3 className="tabular-nums">{tribe1st}</h3>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="relative ordinal border-b border-black">
                                        2nd
                                        <HoverCard openDelay={100} closeDelay={0}>
                                            <HoverCardTrigger>
                                                <span className="absolute text-xs rounded-full border-black -translate-y-1 cursor-help">?</span>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="text-xs text-center border-black shadow-md bg-b2 shadow-zinc-700" sideOffset={10} side="top">
                                                <HoverCardArrow className="absolute translate-x-0.25" />
                                                <p className="normal-nums text-wrap">Applies only to seasons with 3-tribe challenges</p>
                                            </HoverCardContent>
                                        </HoverCard>
                                    </h3>
                                    {/* 2nd place are scored with 0.5 points but we want a count */}
                                    <h3 className="tabular-nums">{tribe2nd * 2}</h3>
                                </div>
                            </div>
                            <div className="grid col-span-3 items-center grid-cols-subgrid">
                                <h3>Individual</h3>
                                <div className="flex flex-col">
                                    <h3 className="border-b border-black">Immunity</h3>
                                    <h3 className="tabular-nums">{indivWin}</h3>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="border-b border-black">Reward</h3>
                                    <h3 className="tabular-nums">{indivReward}</h3>
                                </div>
                            </div>
                        </div>
                    </HoverCardContent>
                </HoverCardPortal>
            </HoverCard>
        </div >
    );
}
