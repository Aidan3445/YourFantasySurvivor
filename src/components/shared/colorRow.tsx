import { type ReactNode } from 'react';
import { cn } from '~/lib/utils';
import { getContrastingColor } from '@uiw/color-convert';

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
        'px-4 gap-4 rounded border border-black flex items-center text-nowrap',
        loggedIn && 'ring-white ring-2',
        className
      )}
      style={{
        backgroundColor: color,
        color: color ? getContrastingColor(color) : '',
        stroke: color ? getContrastingColor(color) : ''
      }}>
      {children}
    </span>
  );
}
