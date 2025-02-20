import { type LeagueMemberDisplayName } from './leagueMembers';
import { type Tribe, type TribeEp, type TribeName } from './tribes';

export type CastawayId = number;
export type CastawayName = string;
export type CastawayAge = number;
export type CastawayHometown = string;
export type CastawayResidence = string;
export type CastawayOccupation = string;

export interface CastawayDetails {
  fullName: CastawayName;
  shortName: CastawayName;
  startingTribe: TribeEp;
  tribes: TribeEp[];
  imageUrl: CastawayImage;
  eliminatedEpisode: number | null;
}

export type CastawayImage = string;

export interface NewCastaway {
  fullName: CastawayName;
  shortName: CastawayName;
  age: CastawayAge;
  residence: CastawayResidence;
  occupation: CastawayOccupation;
  imageUrl: CastawayImage;
  tribe: TribeName;
}

export interface CastawayDraftInfo {
  castawayId: CastawayId;
  fullName: CastawayName;
  age: CastawayAge;
  residence: CastawayResidence;
  occupation: CastawayOccupation;
  imageUrl: CastawayImage;
  tribe: Tribe;
  pickedBy: LeagueMemberDisplayName | null;
}
