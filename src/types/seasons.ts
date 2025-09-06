import { type Castaway } from '~/types/castaways';
import { type TribesTimeline, type Tribe } from '~/types/tribes';
import { type Eliminations, type Events } from '~/types/events';
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
  baseEvents: Events;
  episodes: Episode[];
  tribesTimeline: TribesTimeline;
  eliminations: Eliminations;
}
