import { FinalStat, FireWinStat, SoleSurvivorStat } from "~/app/api/episodes/stats";
import StatsSection from "./statsSection";

interface FinalsStatsProps {
    final: FinalStat;
    fireWin: FireWinStat;
    soleSurvivor: SoleSurvivorStat;
}

export default function FinalsStats({ final, fireWin, soleSurvivor }: FinalsStatsProps) {

    return (
        <figure className="flex flex-col gap-4">
            <StatsSection title="Fire Making">
                <span className="flex justify-center">
                    {fireWin}
                </span>
            </StatsSection>
            <StatsSection title="Finalists">
                <span className="flex justify-center">
                    {final?.join(", ")}
                </span>
            </StatsSection>
            <StatsSection title="Sole Survivors">
                <span className="flex justify-center">
                    {soleSurvivor}
                </span>
            </StatsSection>
        </figure>
    );
}

