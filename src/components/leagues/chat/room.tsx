'use client';

import { useState, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { useMessages } from '@ably/chat/react';
import { type Message } from 'node_modules/@ably/chat/dist/core/message';
import { Input } from '~/components/common/input';
import { Button } from '~/components/common/button';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { useLeague } from '~/hooks/useLeague';
import { type Headers } from '@ably/chat';
import ColorRow from '~/components/shared/colorRow';
import { cn } from '~/lib/utils';
import { UserCog2, Crown } from 'lucide-react';
import { saveChatMessage } from '~/services/leagues/settings/leagueActions';

export interface ChatRoomProps {
  chatHistory?: Message[];
  defaultOpen?: boolean;
  className?: string;
  messageEnd?: ReactNode;
}

export default function ChatRoom({ chatHistory, messageEnd }: ChatRoomProps) {
  const { league: { members, leagueHash } } = useLeague();
  const loggedInUser = members?.loggedIn;

  const inputRef = useRef<HTMLInputElement>(null);

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>(chatHistory ?? []);
  const messageTextIsEmpty = messageText.trim().length === 0;
  const { send: sendMessage } = useMessages({
    listener: (payload) => {
      const newMessage = payload.message;
      setMessages((prevMessages) => {
        if (prevMessages.some(existingMessage =>
          newMessage.timestamp.getTime() === existingMessage.timestamp.getTime())) {
          return prevMessages;
        }

        const index = prevMessages.findIndex(existingMessage =>
          existingMessage.timestamp.getTime() > newMessage.timestamp.getTime());

        const newMessages = [...prevMessages];
        if (index === -1) {
          newMessages.push(newMessage);
        } else {
          newMessages.splice(index, 0, newMessage);
        }
        return newMessages;
      });
    }
  });

  const sendChatMessage = async (text: string) => {
    if (!sendMessage) return;

    const headers: Headers = { 'sent-by-id': loggedInUser?.memberId ?? '' };

    try {
      const message = await sendMessage({ text, headers });
      setMessageText('');
      inputRef.current?.focus();


      await saveChatMessage(
        leagueHash,
        {
          serial: message.serial,
          text: message.text,
          timestamp: message.timestamp.toUTCString(),
        });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSubmit = async () => {
    await sendChatMessage(messageText);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendChatMessage(messageText);
    }
  };

  return (
    <>
      <ScrollArea
        className='flex-1 overflow-auto px-2'
        onClick={() => inputRef.current?.focus()}>
        <br />
        {members.list.length > 0 && messages.map((message) => {
          const member = members.list.find(member => member.memberId === message.headers['sent-by-id']);

          return (
            <div key={message.serial} className={cn('mb-2 bg-white/60 rounded-lg px-2 animate-scale-in-fast w-fit max-w-[80%] text-wrap break-all',
              message.headers['sent-by-id'] === loggedInUser?.memberId ? 'ml-auto bg-card/50' : 'mr-auto')}>
              <div className='text-base'>{message.text}</div>
              <span className='flex items-center gap-1 text-xs border-t pt-0.5'>
                {member?.role === 'Admin' && <UserCog2 size={14} />}
                {member?.role === 'Owner' && <Crown size={14} fill='black' />}
                <ColorRow
                  className='px-1 py-0 leading-none'
                  color={member?.color ?? '#fff'}>
                  {member?.displayName ?? 'Unknown User'}
                </ColorRow>
                <div className='text-xs text-primary'>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </div>
              </span>
            </div>
          );
        })}
        {messageEnd}
        <ScrollBar orientation='vertical' />
      </ScrollArea >
      <form action={() => handleSubmit()} className='relative flex items-center justify-between border-t'>
        <Input
          ref={inputRef}
          type='text'
          placeholder='Type your message...'
          className='w-full rounded-none min-h-12 focus:h-auto pr-16'
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyPress} />
        <Button
          className='absolute right-0 h-full w-16 p-0 rounded-none'
          disabled={messageTextIsEmpty}>
          Send
        </Button>
      </form >
    </>
  );
}
