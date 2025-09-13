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

export type EpisodeInsert = {
  episodeNumber: number;
  title: string;
  airDate: Date;
  runtime?: number;
  isMerge?: boolean;
  isFinale?: boolean;
}

export type EpisodeUpdate = {
  episodeId: number;
  episodeNumber?: number;
  title?: string;
  airDate?: Date;
  runtime?: number;
  isMerge?: boolean;
  isFinale?: boolean;
}

export type KeyEpisodes = {
  previousEpisode: Episode | null;
  nextEpisode: Episode | null;
  mergeEpisode: Episode | null;
};
