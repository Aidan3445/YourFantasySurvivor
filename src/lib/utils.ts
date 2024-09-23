import { type ClassValue, clsx } from 'clsx';
import { type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { type CastawayDetails } from '~/server/db/schema/castaways';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ComponentProps {
  className?: string;
  children?: ReactNode;
}

export function castawaysByTribe(options: CastawayDetails[]): Record<string, CastawayDetails[]> {
  return options.reduce((acc, c) => {
    if (!acc[c.startingTribe.name]) acc[c.startingTribe.name] = [];
    acc[c.startingTribe.name]!.push(c);
    return acc;
  }, {} as Record<string, CastawayDetails[]>);
}
