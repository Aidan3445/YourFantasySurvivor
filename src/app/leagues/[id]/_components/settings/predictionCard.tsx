'use client';
import { HoverCardPortal } from '@radix-ui/react-hover-card';
import { Info } from 'lucide-react';
import { useState } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/app/_components/commonUI/hover';
import { cn, type ComponentProps } from '~/lib/utils';
import { type SeasonEventRuleType } from '~/server/db/schema/seasonEvents';
import { type WeeklyEventRuleType } from '~/server/db/schema/weeklyEvents';

interface PredictionCardProps extends ComponentProps {
  prediction: SeasonEventRuleType | WeeklyEventRuleType;
  parity?: boolean;
  vote?: boolean;
}

export function PredictionCard({ prediction, parity, vote, className, children }: PredictionCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn(parity ? 'bg-b4/70' : 'bg-b3/80', 'p-2 rounded-md', className)}>
      <span className='flex gap-2 justify-between text-xs'>
        <p>{vote ? 'Vote for' : 'Predict'} {prediction.eventName} {prediction.points != 0 ? `for ${prediction.points} points.` : ''}</p>
        <HoverCard open={open} onOpenChange={() => setOpen(!open)}>
          <HoverCardTrigger onClick={() => setOpen(!open)}>
            <Info size={16} />
          </HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent>
              <p>{prediction.description}</p>
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCard>
      </span>
      {children ? children : <p className='text-xs italic'>Choose a {prediction.referenceType}</p>}
    </div >
  );
}
