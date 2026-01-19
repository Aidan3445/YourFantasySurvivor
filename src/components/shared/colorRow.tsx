import { type ReactNode } from 'react';
import { cn } from '~/lib/utils';

export interface ColorRowProps {
  color?: string;
  loggedIn?: boolean;
  className?: string;
  children: ReactNode;
}

export default function ColorRow({ color, loggedIn, className, children }: ColorRowProps) {
  return (
    <span
      className={cn(
        'w-full inline-flex px-4 py-0.5 gap-4 text-nowrap items-center rounded-md border-t border-b border-r border-transparent',
        loggedIn && 'text-primary',
        className
      )}
      style={{
        backgroundColor: `${color ?? '#AAAAAA'}20`,
        borderLeft: `0.25rem solid ${color ?? '#000000'}`,
      }}>
      {children}
    </span>
  );
}
