"use client";
import { useState } from "react";
import { HoverCardArrow, HoverCardPortal } from "@radix-ui/react-hover-card";
import { User, Users } from "lucide-react";
import { HoverCardContent } from "~/app/_components/commonUI/hover";
import { HoverCard, HoverCardTrigger } from "~/app/_components/commonUI/hover";
import { type CastawayChallengeStat, type TribeChallengeStat } from "~/app/api/seasons/[name]/events/stats";
import StatsSection from "./statsSection";
import { Switch } from "../commonUI/switch";
import { Label } from "../commonUI/label";
import { cn } from "~/lib/utils";

interface ChallengesPodiumProps {
    castaways: CastawayChallengeStat[];
    tribes: TribeChallengeStat[];
}

export default function ChallengesPodium({ castaways, tribes }: ChallengesPodiumProps) {
    const [showTribes, setShowTribes] = useState(false);

    const titleSpan = (
        <span className="flex justify-between">
            Challenges
            <div className="flex gap-2 items-center px-2">
                <Label htmlFor="showTribes">Tribes</Label>
                <Switch id="showTribes" checked={showTribes} onCheckedChange={setShowTribes} />
            </div>
        </span>
    );

    return (
        <StatsSection title={titleSpan}>
            <figure className="grid relative grid-flow-col auto-cols-fr gap-1 px-1 pt-3">
                <Podium
                    castaway={castaways[1]}
                    tribe={tribes[1]}
                    showTribes={showTribes}
                    className="bg-gradient-to-br from-zinc-300 to-zinc-400 h-24 shimmer1" />
                <Podium
                    castaway={castaways[0]}
                    tribe={tribes[0]}
                    showTribes={showTribes}
                    className="bg-gradient-to-br from-amber-300 to-amber-500 h-32 shimmer2" />
                <Podium
                    castaway={castaways[2]}
                    tribe={tribes[2]}
                    showTribes={showTribes}
                    className="bg-gradient-to-br from-amber-600 to-amber-700 h-20 shimmer3" />
            </figure>
        </StatsSection>
    );
}

interface PodiumProps {
    castaway: CastawayChallengeStat | undefined;
    tribe: TribeChallengeStat | undefined;
    showTribes: boolean;
    className: string;
}

function Podium({ castaway, tribe, showTribes, className }: PodiumProps) {

    if (!castaway && !tribe) {
        showTribes = false;
        castaway = {
            name: "Loading...",
            indivWin: 0,
            indivReward: 0,
            tribe1st: 0,
            tribe2nd: 0
        };
    }

    const name = (showTribes ? tribe?.name : castaway?.name)!;
    const indivWin = castaway?.indivWin ?? 0
    const indivReward = castaway?.indivReward ?? 0
    const tribe1st = (showTribes ? tribe?.tribe1st : castaway?.tribe1st)!;
    const tribe2nd = (showTribes ? tribe?.tribe2nd : castaway?.tribe2nd)!;

    return (
        <div className="self-end text-center">
            <HoverCard openDelay={200} closeDelay={100}>
                <HoverCardTrigger>
                    <h3 className="p-0 m-0 w-full text-sm font-medium md:text-base truncate">{name}</h3>
                    <div className={cn("flex flex-col gap-1 p-1 justify-center items-center rounded-t-md border-2 border-b-0 border-black border-solid text-center relative overflow-hidden",
                        className)}>
                        {!showTribes &&
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
                        <div className="grid grid-cols-3 gap-2 text-center">
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
                                    <h3 className="tabular-nums">{tribe2nd}</h3>
                                </div>
                            </div>
                            {!showTribes &&
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
                            }
                        </div>
                    </HoverCardContent>
                </HoverCardPortal>
            </HoverCard>
        </div >
    );
}
