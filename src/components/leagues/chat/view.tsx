'use client';

import { useParams } from 'next/navigation';
import { Realtime } from 'ably';
import { ChatClient } from '@ably/chat';
import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';
import ChatRoom, { type ChatRoomProps } from '~/components/leagues/chat/room';

export default function LeagueChat({ chatHistory, messageEnd }: ChatRoomProps) {
  const params = useParams();
  const hash = params.hash as string;

  const realtimeClient = new Realtime({ authUrl: `/api/leagues/${hash}/chat` });
  const chatClient = new ChatClient(realtimeClient);

  return (
    <ChatClientProvider client={chatClient}>
      <ChatRoomProvider name={hash}>
        <ChatRoom chatHistory={chatHistory} messageEnd={messageEnd} />
      </ChatRoomProvider>
    </ChatClientProvider>
  );
}

