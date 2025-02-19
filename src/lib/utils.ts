import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type QUERIES as SEASON_QUERIES } from '~/app/api/seasons/query';
import { type CastawayDetails } from '~/server/db/defs/castaways';
import { type EpisodeNumber } from '~/server/db/defs/episodes';
import { type LeagueHash } from '~/server/db/defs/leagues';
import { type TribeName } from '~/server/db/defs/tribes';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type SWRKey = { leagueHash: LeagueHash, key: string };

/**
  * Find the castaways on a tribe at a given episode
  * @param tribeUpdates The tribe updates for the season
  * @param eliminations The eliminations for the season
  * @param tribeName The tribe to find castaways for
  * @param episodeNumber The episode to find castaways for
  * @returns The castaways on the tribe at the given episode
  */
export function findTribeCastaways(
  tribeUpdates: Awaited<ReturnType<typeof SEASON_QUERIES.getTribesTimeline>>,
  eliminations: Awaited<ReturnType<typeof SEASON_QUERIES.getEliminations>>,
  tribeName: TribeName,
  episodeNumber: EpisodeNumber) {

  const onTribe = new Set(tribeUpdates[1]?.[tribeName]?.castaways ?? []);

  for (let i = 2; i <= episodeNumber; i++) {
    eliminations[i - 1]?.forEach((castaway) => onTribe.delete(castaway));
    if (!tribeUpdates[i]) continue;
    Object.entries(tribeUpdates[i]!).forEach(([tribeName, update]) => {
      if (tribeName === tribeName) {
        update.castaways.forEach((castaway) => onTribe.add(castaway));
      } else {
        update.castaways.forEach((castaway) => onTribe.delete(castaway));
      }
    });
  }

  return [...onTribe];
}













export function castawaysByTribe(options: CastawayDetails[]): Record<string, CastawayDetails[]> {
  return options.reduce((acc, c) => {
    if (!acc[c.startingTribe.tribeName]) acc[c.startingTribe.tribeName] = [];
    acc[c.startingTribe.tribeName]!.push(c);
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
