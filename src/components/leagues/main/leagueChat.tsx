'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';


export default function LeagueChat() {
  const [open, setOpen] = useState(true);

  return (
    <div className={cn('relative w-1/2 transition-all', open ? 'w-1/2' : 'w-0')}>
      <section className={cn('w-full border shadow-lg md:bg-secondary rounded-3xl md:h-[calc(100svh-5rem)] transition-all',
        !open && 'border-0')
      }>
        <div className={cn('flex flex-col h-full transition-all',
          !open && 'hidden')}>
          <h3 className='bg-b3 text-xl leading-none text-center font-semibold p-2 border-b h-10 rounded-t-3xl'>
            League Chat
          </h3>
          <div className='flex-1 overflow-auto p-4'>
            {/* Chat messages will go here */}
          </div>
          <Input
            type='text'
            placeholder='Type your message...'
            className='w-full rounded-t-none rounded-b-3xl min-h-12 focus:h-auto' />
        </div>
      </section>
      <div
        className={cn('absolute bottom-1/2 -left-3.5 h-12 w-3.5 bg-primary rounded-full place-items-center py-3 cursor-pointer hover:bg-primary/80 active:bg-primary/60 transition-all',
        )}
        onClick={() => setOpen(!open)}>
        {open ? <ChevronRight stroke='white' /> : <ChevronLeft stroke='white' />}

      </div>
    </div>
  );
}

