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
    <section className='flex gap-2 justify-center md:px-10 w-svw'>
      <article className='flex overflow-x-auto gap-2 light-scroll'>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className='mb-2 min-w-72'>
            {children}
          </div>
        ))}
      </article>
      {!disabled && (
        <div className='hidden gap-2 items-center self-start mt-5 lg:flex'>
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
