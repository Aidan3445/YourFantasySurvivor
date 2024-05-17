import { HoverCardContent } from "~/app/_components/commonUI/hover";
import { HoverCard, HoverCardTrigger } from "~/app/_components/commonUI/hover";
import { ChallengeStat } from "~/app/api/episodes/stats";

type ChallengesPodiumProps = {
    challenges: ChallengeStat[];
}

export default function ChallengesPodium(props: ChallengesPodiumProps) {
    const { challenges } = props;

    return (
        <section className="rounded-lg border-2 border-black border-solid">
            <h3 className="text-xl font-semibold border-b-2 border-black indent-1">Challenges</h3>
            <figure className="grid grid-flow-col auto-cols-fr gap-1 px-1 pt-2">
                <Podium stats={challenges[1]} color="bg-gradient-to-r from-zinc-400 via-zinc-300 to-zinc-400" height="h-24" />
                <Podium stats={challenges[0]} color="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400" height="h-32" />
                <Podium stats={challenges[2]} color="bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700" height="h-20" />
            </figure>
        </section>

    );
}

type PodiumProps = {
    stats?: ChallengeStat;
    color: string;
    height: string;
}

function Podium(props: PodiumProps) {
    var { stats, color, height } = props;

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
        <div className="self-end">
            <HoverCard openDelay={200} closeDelay={0}>
                <HoverCardTrigger>
                    <h3 className="p-0 m-0 w-full font-medium sm:text-lg text-md truncate">{stats.castaway}</h3>
                    <div className={`flex flex-col ${height} gap-1 p-1 justify-center items-center 
                        rounded-t-md border-2 border-b-0 border-black border-solid ${color} text-center`}>
                        <span className="flex gap-2 items-center">
                            <div className="w-5 h-5 bg-white rounded-full border border-black sm:w-6 sm:h-6">I</div>
                            <h4 className="font-medium">{stats.indivWin + stats.indivReward}</h4>
                        </span>
                        <span className="flex gap-2 items-center">
                            <div className="w-5 h-5 bg-white rounded-full border border-black sm:w-6 sm:h-6">T</div>
                            <h4 className="font-medium">{stats.tribe1st + stats.tribe2nd}</h4>
                        </span>
                    </div>
                </HoverCardTrigger>
                <HoverCardContent className="gap-2 border-black bg-b2 w-50 text-nowrap" side="top">
                    <div className="flex gap-2 justify-between">
                        <h3>Tribe 1st places:</h3>
                        <h3 className="font-mono">{stats.tribe1st}</h3>
                    </div>
                    <div className="flex gap-2 justify-between">
                        <h3>Tribe 2nd places:</h3>
                        <h3 className="font-mono">{stats.tribe2nd}</h3>
                    </div>
                    <div className="flex gap-2 justify-between">
                        <h3>Individual wins:</h3>
                        <h3 className="font-mono">{stats.indivWin}</h3>
                    </div>
                    <div className="flex gap-2 justify-between">
                        <h3>Individual rewards:</h3>
                        <h3 className="font-mono">{stats.indivReward}</h3>
                    </div>
                </HoverCardContent>
            </HoverCard>
        </div>
    );
}
