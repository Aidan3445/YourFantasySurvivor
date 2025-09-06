import { type Castaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';
import type { Elimination, EventWithReferences } from '~/types/events';
import { type Episode } from '~/types/episodes';

export type Season = {
  seasonId: number;
  name: string;
  premiereDate: Date;
  finaleDate: Date | null;
}

export type SeasonsDataQuery = {
  season: Season;
  castaways: Castaway[];
  tribes: Tribe[];
  baseEvents: Record<number, Record<number, EventWithReferences>>;
  episodes: Episode[];
  tribesTimeline: Record<number, Record<number, number[]>>;
  eliminations: Record<number, Elimination[]>;
}
