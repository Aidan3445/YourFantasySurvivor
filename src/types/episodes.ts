import { type AirStatuses } from '~/lib/episodes';

export type AirStatus = (typeof AirStatuses)[number];

export type Episode = {
  seasonId: number;
  episodeId: number;
  episodeNumber: number;
  title: string;
  airDate: Date;
  runtime: number;
  airStatus: AirStatus;
  isMerge: boolean;
  isFinale: boolean;
};
