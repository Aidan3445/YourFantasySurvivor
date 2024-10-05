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

export function getCurrentTribe(castaway?: CastawayDetails, episode?: number) {
  if (!castaway) return;

  episode = episode ?? castaway.tribes[castaway.tribes.length - 1]?.episode;
  return castaway.tribes.find((t) => t.episode <= (episode ?? 0)) ?? castaway.startingTribe;
}
