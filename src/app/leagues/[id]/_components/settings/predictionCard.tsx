import { cn, type ComponentProps } from '~/lib/utils';
import { type SeasonEventRuleType } from '~/server/db/schema/seasonEvents';
import { type WeeklyEventRuleType } from '~/server/db/schema/weeklyEvents';

interface PredictionCardProps extends ComponentProps {
  prediction: SeasonEventRuleType | WeeklyEventRuleType;
  parity: boolean;
}

export function PredictionCard({ prediction, parity, className, children }: PredictionCardProps) {
  return (
    <div className={cn(parity ? 'bg-b4/70' : 'bg-b3/80', 'p-2 rounded-md', className)}>
      <p>Predict {prediction.name} for {prediction.points} points.</p>
      {children ? children : <p className='text-xs italic'>Choose a {prediction.referenceType}</p>}
    </div >
  );
}
