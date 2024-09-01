'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn, type ComponentProps } from '~/lib/utils';

interface CountdownProps extends ComponentProps {
  children: ReactNode;
  endDate: Date;
}

export default function Countdown({ endDate, children, className }: CountdownProps) {
  const [timer, setTimer] = useState(endDate.getTime() - Date.now());

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
      <span className={cn(className, timer > 0 ? 'pointer-events-none' : '')}>
        Draft on {endDate.toLocaleString()}
        <br />
        <div className='font-mono'>
          {days}:
          {String(hours).padStart(2, '0')}:
          {String(minutes).padStart(2, '0')}:
          {String(seconds).padStart(2, '0')}
        </div>
      </span >
      :
      children
  );
}
