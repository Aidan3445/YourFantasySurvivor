'use client';
import { useState } from 'react';
import { Button } from '~/app/_components/commonUI/button';
import { Separator } from '~/app/_components/commonUI/separator';
import { type ComponentProps } from '~/lib/utils';

interface EventQueueProps extends ComponentProps {
  disabled?: boolean;
}

export function EventQueue({ children, disabled }: EventQueueProps) {
  const [count, setCount] = useState(1);

  return (
    <section className='flex gap-2 justify-center w-svw md:px-10'>
      <article className='flex gap-2 overflow-x-auto light-scroll'>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className='min-w-72 mb-2'>
            {children}
          </div>
        ))}
      </article>
      {!disabled && (
        <div className='gap-2 items-center self-start mt-5 hidden lg:flex'>
          <Separator orientation='vertical' className='h-20' />
          <div className='flex flex-col gap-2'>
            <Button onClick={() => setCount(count + 1)}>Add</Button>
            <Button onClick={() => setCount(1)} disabled={count === 1}>Reset</Button>
          </div>
        </div>
      )}
    </section>
  );
}
