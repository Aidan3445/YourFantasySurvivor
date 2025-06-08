'use client';

import { useParams } from 'next/navigation';
import { Realtime } from 'ably';
import { ChatClient } from '@ably/chat';
import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';
import ChatRoom, { type ChatRoomProps } from './chatRoom';

export default function LeagueChat({ chatHistory }: ChatRoomProps) {
  const params = useParams();
  const leagueHash = params.leagueHash as string;

  const realtimeClient = new Realtime({ authUrl: `/api/leagues/${leagueHash}/chat` });
  const chatClient = new ChatClient(realtimeClient);

  return (
    <ChatClientProvider client={chatClient}>
      <ChatRoomProvider name={leagueHash}>
        <ChatRoom chatHistory={chatHistory} />
      </ChatRoomProvider>
    </ChatClientProvider>
  );
}

