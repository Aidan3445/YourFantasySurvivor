import { type ClassValue, clsx } from 'clsx';
import { type CSSProperties, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { type CastawayDetails } from '~/server/db/schema/castaways';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ComponentProps {
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
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

  episode ??= castaway.tribes[castaway.tribes.length - 1]?.episode;
  return [...castaway.tribes].find((t) => t.episode <= (episode ?? 0)) ?? castaway.startingTribe;
}

export function camelToTitle(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
}

export function getHslIndex(index: number, total: number) {
  return `hsl(${300 * index / total}, ${index & 1 ? '50%' : '80%'}, 50%)`;
}
