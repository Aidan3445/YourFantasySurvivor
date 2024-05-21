import { FinalStat, FireWinStat, SoleSurvivorStat, TitleStat } from "~/app/api/episodes/stats";
import { PieChart } from '@mui/x-charts/PieChart';

interface OtherStatsProps {
    titles: TitleStat[];
    final: FinalStat;
    fireWin: FireWinStat;
    soleSurvivor: SoleSurvivorStat;
}

export default function OtherStats({ titles, final, fireWin, soleSurvivor }: OtherStatsProps) {
    return (
        <div className="p-4 justify-center items-center">
            Other Stats
            <PieChart
                series={[{ data: titles.map((title, index) => ({ id: index, value: title.count, label: title.castaway })) }]}
                title="Titles"
                height={100}
            />
        </div>
    );
}
