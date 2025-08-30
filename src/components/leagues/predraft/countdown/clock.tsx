'use client';

import { type ReactNode, useEffect, useState } from 'react';

interface ClockProps {
    endDate: Date | null;
    replacedBy?: ReactNode;
}

export default function Clock({ endDate, replacedBy }: ClockProps) {
    const [timer, setTimer] = useState<number | null>(null);

    useEffect(() => {
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
            <span className='w-full flex text-white text-4xl  justify-evenly'>
                <ClockPlace value={days.toString()} label={days === 1 ? 'Day' : 'Days'} />
                :
                <ClockPlace value={hours.toString()} label={hours === 1 ? 'Hour' : 'Hours'} />
                :
                <ClockPlace value={minutes.toString()} label={minutes === 1 ? 'Minute' : 'Minutes'} />
                :
                <ClockPlace value={seconds.toString()} label={seconds === 1 ? 'Second' : 'Seconds'} />
            </span>
            :
            replacedBy
    );
}

interface ClockPlaceProps {
    value: string;
    label: string;
}

function ClockPlace({ value, label }: ClockPlaceProps) {
    return (
        <div className='flex flex-col text-center'>
            <h1 className='text-4xl font-bold text-sidebar'>{value}</h1>
            <p className='text-xs text-muted'>{label}</p>
        </div>
    );
}