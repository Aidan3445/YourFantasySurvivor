'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { useIsMobile } from '~/hooks/ui/useMobile';

interface ClockProps {
  endDate: Date | null;
  replacedBy?: ReactNode;
}

export default function Clock({ endDate, replacedBy }: ClockProps) {
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    if (!endDate && timer !== null) {
      setTimer(null);
      return;
    }
    if (!endDate || (timer !== null && timer <= 0)) return;
    if (timer === null) setTimer(endDate.getTime() - Date.now());

    const interval = setInterval(() => {
      setTimer(endDate.getTime() - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate, timer]);

  const days = timer ? Math.floor(timer / (1000 * 60 * 60 * 24)) : '--';
  const hours = timer ? Math.floor((timer / (1000 * 60 * 60)) % 24) : '--';
  const minutes = timer ? Math.floor((timer / (1000 * 60)) % 60) : '--';
  const seconds = timer ? Math.floor((timer / 1000) % 60) : '--';

  return (
    !timer || timer > 0 ?
      <div className='w-full pt-6! pb-2 md:py-4 px-1 md:px-4 flex justify-center'>
        <div className='flex items-center justify-evenly gap-3 md:gap-4 w-2/3'>
          <ClockPlace value={days.toString()} label={days === 1 ? 'Day' : 'Days'} />
          <div className='flex items-center justify-center'>
            <span className='text-3xl md:text-4xl font-black text-primary'>:</span>
          </div>
          <ClockPlace value={hours.toString()} label={hours === 1 ? 'Hour' : 'Hours'} />
          <div className='flex items-center justify-center'>
            <span className='text-3xl md:text-4xl font-black text-primary'>:</span>
          </div>
          <ClockPlace value={minutes.toString()} label={minutes === 1 ? 'Minute' : 'Minutes'} />
          <div className='flex items-center justify-center'>
            <span className='text-3xl md:text-4xl font-black text-primary'>:</span>
          </div>
          <ClockPlace value={seconds.toString()} label={seconds === 1 ? 'Second' : 'Seconds'} />
        </div>
      </div>
      :
      replacedBy
  );
}

interface ClockPlaceProps {
  value: string;
  label: string;
}

function ClockPlace({ value, label }: ClockPlaceProps) {
  const isMobile = useIsMobile();

  return (
    <div className='w-full flex flex-col items-center justify-center bg-primary/5 border border-primary/20 rounded-lg md:p-2'>
      <span className='text-xl md:text-4xl font-black text-primary tabular-nums sm:w-14'>
        {value.toString().padStart(2, '0')}
      </span>
      <span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1'>
        {isMobile ? label.charAt(0) : label}
      </span>
    </div>
  );
}
