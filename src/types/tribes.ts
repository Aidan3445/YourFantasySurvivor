import { type CastawayName } from '~/types/castaways';
import { type EpisodeNumber } from '~/types/episodes';
import { type SeasonName } from '~/types/seasons';

export type TribeId = number;
export type TribeName = string;
export type TribeColor = string;

export interface Tribe {
  tribeId: TribeId;
  tribeName: TribeName;
  tribeColor: TribeColor;
  seasonName: SeasonName
}

export interface NewTribe {
  tribeName: TribeName;
  tribeColor: TribeColor;
}

export type TribeEp = {
  tribeId: TribeId;
  tribeName: TribeName;
  tribeColor: TribeColor;
  episode: EpisodeNumber
};

export type TribeUpdate = {
  tribeColor: TribeColor;
  castaways: CastawayName[];
};