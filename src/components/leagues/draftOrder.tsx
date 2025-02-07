'use client';

import { useLeague } from '~/hooks/useLeague';
import { getContrastingColor } from '@uiw/color-convert';
import { type ReactNode } from 'react';
import { cn } from '~/lib/utils';

export default function DraftOrder() {
  const {
    league: {
      members,
      settings: {
        draftOrder
      },
    }
  } = useLeague();


  const draftOrderList = draftOrder.map((memberId) => {
    const member = members.list.find((m) => m.memberId === memberId);
    return member;
  }).filter((member) => !!member);

  return (
    <article className='flex flex-col w-full p-2 bg-accent rounded-xl'>
      <h2 className='text-lg font-bold text-accent-foreground'>Draft Order</h2>
      <div className='flex flex-col gap-2'>
        {draftOrderList.map((member, index) => (
          <ColorRow key={member.memberId} color={member.color} loggedIn={members.loggedIn?.memberId === member.memberId}>
            <h3 className='text-lg' style={{ color: getContrastingColor(member.color) }}>{index + 1}</h3>
            <h2 className='text-3xl font-semibold' style={{ color: getContrastingColor(member.color) }}>{member.displayName}</h2>
          </ColorRow>
        ))}
      </div>
    </article>
  );
}

interface ColorRowProps {
  color: string;
  loggedIn: boolean;
  children: ReactNode;
}

function ColorRow({ color, loggedIn, children }: ColorRowProps) {
  return (
    <span
      className={cn(
        'px-4 gap-4 rounded border border-black flex items-center text-nowrap',
        loggedIn && 'border-none ring-2 ring-white'
      )}
      style={{ backgroundColor: color, color: getContrastingColor(color) }}>
      {children}
    </span>
  );
}

