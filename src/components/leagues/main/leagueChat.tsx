'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Realtime } from 'ably';
import { ChatClient } from '@ably/chat';
import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';
import ChatRoom, { type ChatRoomProps } from './chatRoom';

export default function LeagueChat({ chatHistory }: ChatRoomProps) {
  const params = useParams();
  const leagueHash = params.leagueHash as string;
  const [open, setOpen] = useState(true);

  const realtimeClient = new Realtime({ authUrl: `/api/leagues/${leagueHash}/chat` });
  const chatClient = new ChatClient(realtimeClient);
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
          <ChatClientProvider client={chatClient}>
            <ChatRoomProvider name={leagueHash}>
              <ChatRoom chatHistory={chatHistory} />
            </ChatRoomProvider>
          </ChatClientProvider>
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

