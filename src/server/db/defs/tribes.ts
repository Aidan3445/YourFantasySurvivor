import { type EpisodeNumber } from './episodes';
import { type SeasonName } from './seasons';

export type TribeId = number;
export type TribeName = string;
export type TribeColor = string;

export interface Tribe {
  tribeId: TribeId;
  tribeName: TribeName;
  color: TribeColor;
  season: SeasonName
}

export interface NewTribe {
  tribeName: TribeName;
  color: TribeColor;
}

export type TribeEp = {
  tribeName: TribeName;
  color: TribeColor;
  episode: EpisodeNumber
};
