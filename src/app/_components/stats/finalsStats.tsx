import type { FinalStat, FireWinStat, SoleSurvivorStat } from '~/app/api/seasons/[name]/events/stats';
import StatsSection from './statsSection';

interface FinalsStatsProps {
    final: FinalStat;
    fireWin: FireWinStat;
    soleSurvivor: SoleSurvivorStat;
}

export default function FinalsStats({ final, fireWin, soleSurvivor }: FinalsStatsProps) {

  return (
    <figure className='flex flex-col gap-4'>
      <Stat title='Fire Making' content={fireWin!} />
      <Stat title='Finalists' content={final?.join(', ') ?? ''} />
      <Stat title='Sole Survivor' content={soleSurvivor!} />
    </figure>
  );
}

interface StatProps {
    title: string;
    content: string;
}

function Stat({ title, content }: StatProps) {
  if (!content) {
    content = `No ${title.toLowerCase()} yet in this season.`;
  }

  return (
    <StatsSection title={title}>
      <span className='flex justify-center font-medium'>
        {content}
      </span>
    </StatsSection>
  );
}

