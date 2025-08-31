export type EpisodeId = number;
export type EpisodeNumber = number;
export type EpisodeTitle = string;
export type EpisodeAirStatus = 'Aired' | 'Upcoming' | 'Airing';

export type Episode = {
  episodeId: EpisodeId;
  episodeNumber: EpisodeNumber;
  episodeTitle: EpisodeTitle;
  episodeAirDate: Date;
  airStatus: EpisodeAirStatus;
  isMerge: boolean;
  isFinale: boolean;
};
