import { Info } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/app/_components/commonUI/hover';
import { cn, type ComponentProps } from '~/lib/utils';
import { type SeasonEventRuleType } from '~/server/db/schema/seasonEvents';
import { type WeeklyEventRuleType } from '~/server/db/schema/weeklyEvents';

interface PredictionCardProps extends ComponentProps {
  prediction: SeasonEventRuleType | WeeklyEventRuleType;
  parity?: boolean;
}

export function PredictionCard({ prediction, parity, className, children }: PredictionCardProps) {
  return (
    <div className={cn(parity ? 'bg-b4/70' : 'bg-b3/80', 'p-2 rounded-md', className)}>
      <span className='text-xs inline-flex gap-2 items-center'>
        <p>Predict {prediction.name} {prediction.points != 0 ? `for ${prediction.points} points.` : ''}</p>
        <HoverCard>
          <HoverCardTrigger>
            <Info size={16} />
          </HoverCardTrigger>
          <HoverCardContent>
            <p>{prediction.description}</p>
          </HoverCardContent>
        </HoverCard>
      </span>
      {children ? children : <p className='text-xs italic'>Choose a {prediction.referenceType}</p>}
    </div >
  );
}
