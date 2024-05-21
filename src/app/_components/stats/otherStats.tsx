import { FinalStat, FireWinStat, SoleSurvivorStat } from "~/app/api/episodes/stats";

interface OtherStatsProps {
    final: FinalStat;
    fireWin: FireWinStat;
    soleSurvivor: SoleSurvivorStat;
}

export default function OtherStats({ final, fireWin, soleSurvivor }: OtherStatsProps) {

    return (
        <figure className="p-2 flex gap-4">

n       </figure>
    );
}

interface RadioItemProps {
    id: string;
    children: React.ReactNode;
}

