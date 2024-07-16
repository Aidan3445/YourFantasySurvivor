import { cn } from '~/lib/utils';
import type { ReactNode } from 'react';

interface CardContainerProps {
  children: ReactNode;
  className?: string;
}

export default function CardContainer({ children, className }: CardContainerProps) {
  return (
    <article
      className={cn('flex flex-col gap-2 mx-4 sm:m-2 text-black rounded-xl backdrop-blur border-2 border-black ring-4 outline-black corner-frame outline outline-4 outline-offset-4 bg-b4/40 ring-b1',
        className)}>
      <div className='tl-corner' />
      <div className='tr-corner' />
      {children}
      <div className='bl-corner' />
      <div className='br-corner' />
    </article>
  );
}
