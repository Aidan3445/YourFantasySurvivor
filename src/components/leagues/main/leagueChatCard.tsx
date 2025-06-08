'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '~/lib/utils';
import { type ChatRoomProps } from './chatRoom';
import dynamic from 'next/dynamic';

const LeagueChat = dynamic(() => import('./leagueChat'), {
  ssr: false,
});


export default function LeagueChatCard({ chatHistory }: ChatRoomProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className={cn('relative w-1/2 transition-all', open ? 'w-1/2' : 'w-0')}>
      <section className={cn('w-full border shadow-lg md:bg-secondary overflow-clip rounded-3xl md:h-[calc(100svh-5rem)] transition-all',
        !open && 'border-0')
      }>
        <div className={cn('flex flex-col h-full transition-all',
          !open && 'hidden')}>
          <h3 className='bg-b3 text-xl leading-none text-center font-semibold p-2  h-10 rounded-t-3xl shadow-md shadow-primary'>
            League Chat
          </h3>
          <LeagueChat chatHistory={chatHistory} />
        </div>
      </section>
      <div
        className='absolute bottom-1/2 -left-3.5 h-12 w-3.5 bg-primary rounded-full place-items-center py-3 cursor-pointer hover:bg-primary/80 active:bg-primary/60 transition-all'
        onClick={() => setOpen(!open)}>
        {open ? <ChevronRight stroke='white' /> : <ChevronLeft stroke='white' />}
      </div>
    </div>
  );
}

