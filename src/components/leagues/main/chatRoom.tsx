'use client';

import { useState, useRef, type FormEvent, useEffect, type KeyboardEvent } from 'react';
import { useMessages } from '@ably/chat/react';
import { type Message } from 'node_modules/@ably/chat/dist/core/message';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { ScrollArea, ScrollBar } from '~/components/ui/scrollArea';
import { useLeague } from '~/hooks/useLeague';
import { type Headers } from '@ably/chat';
import { ColorRow } from '../draftOrder';
import { cn } from '~/lib/utils';

export default function ChatRoom() {
  const { league: { members } } = useLeague();
  const loggedInUser = members?.loggedIn;

  const inputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messageTextIsEmpty = messageText.trim().length === 0;
  const { send: sendMessage } = useMessages({
    listener: (payload) => {
      const newMessage = payload.message;
      setMessages((prevMessages) => {
        if (prevMessages.some(existingMessage => newMessage.isSameAs(existingMessage))) {
          return prevMessages;
        }

        const index = prevMessages.findIndex(existingMessage => existingMessage.after(newMessage));

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

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendChatMessage = async (text: string) => {
    if (!sendMessage) return;

    const headers: Headers = {
      'sent-by-id': loggedInUser?.memberId ?? '',
      'sent-by-name': loggedInUser?.displayName ?? 'Unknown User',
    };

    try {
      await sendMessage({ text, headers });
      setMessageText('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendChatMessage(messageText);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendChatMessage(messageText);
    }
  };



  return (
    <>
      <ScrollArea className='flex-1 overflow-auto px-2'>
        <p className='text-center text-sm text-muted-foreground mb-2'>
          Messages are deleted after 30 days.
        </p>
        {messages.map((message) => (
          <div key={message.serial} className={cn('mb-2 bg-card rounded-lg px-2 animate-scale-in-fast w-fit max-w-[80%]',
            message.headers['sent-by-id'] === loggedInUser?.memberId ? 'ml-auto bg-card/50' : 'mr-auto')}>
            <div className='text-base'>{message.text}</div>
            <span className='flex items-center gap-2 text-xs'>
              <ColorRow
                className='px-1 py-0 leading-none'
                color={members.list.find(member => member.memberId === message.headers['sent-by-id'])?.color}>
                {message.headers['sent-by-name']}
              </ColorRow>
              <div className='text-xs text-primary'>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </div>
            </span>
          </div>
        ))}
        <div ref={messageEndRef} className='h-0' />
        <ScrollBar orientation='vertical' />
      </ScrollArea >
      <span className='relative flex items-center justify-between border-t'>
        <ScrollArea className='w-full'>
          <Input
            ref={inputRef}
            type='text'
            placeholder='Type your message...'
            className='w-full rounded-none min-h-12 focus:h-auto pr-16'
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress} />
          <ScrollBar orientation='horizontal' />
        </ScrollArea>
        <Button
          className='absolute right-0 h-full w-16 p-0 rounded-none'
          disabled={messageTextIsEmpty}
          onClick={handleSubmit}>
          Send
        </Button>
      </span>
    </>
  );
}
