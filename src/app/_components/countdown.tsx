'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn, type ComponentProps } from '~/lib/utils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './commonUI/hover';
import { HoverCardPortal } from '@radix-ui/react-hover-card';

interface CountdownProps extends ComponentProps {
  children: ReactNode;
  endDate: Date;
}

export default function Countdown({ endDate, children, className }: CountdownProps) {
  const [timer, setTimer] = useState(endDate.getTime() - Date.now());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer(endDate.getTime() - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate, timer]);

  const days = Math.floor(timer / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timer / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timer / (1000 * 60)) % 60);
  const seconds = Math.floor((timer / 1000) % 60);

  return (
    timer > 0 ?
      <span className={cn('w-full flex', className)}>
        <HoverCard openDelay={100} open={open} onOpenChange={setOpen}>
          <HoverCardTrigger
            className='flex-grow tabular-nums'
            onClick={() => setOpen(!open)}>
            {days}:
            {String(hours).padStart(2, '0')}:
            {String(minutes).padStart(2, '0')}:
            {String(seconds).padStart(2, '0')}
          </HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent side='top'>
              Draft on {endDate.toLocaleString()}
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCard>
      </span>
      :
      children
  );
}
