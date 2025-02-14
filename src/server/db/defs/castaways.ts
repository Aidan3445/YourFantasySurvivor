import { type LeagueMemberDisplayName } from './leagueMembers';
import { type SeasonName } from './seasons';
import { type TribeName, type TribeEp, type TribeColor } from './tribes';

export type CastawayId = number;
export type CastawayName = string;
export type CastawayAge = number;
export type CastawayHometown = string;
export type CastawayResidence = string;
export type CastawayOccupation = string;

export interface CastawayDetails {
  castawayId: CastawayId;
  shortName: CastawayName;
  tribes: TribeEp[];
  startingTribe: TribeEp;
  details: {
    fullName: CastawayName;
    age: CastawayAge;
    hometown: CastawayHometown;
    residence: CastawayResidence;
    occupation: CastawayOccupation;
    season: SeasonName;
  };
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
  fullName: CastawayName;
  age: CastawayAge;
  residence: CastawayResidence;
  occupation: CastawayOccupation;
  imageUrl: CastawayImage;
  tribe: {
    tribeName: TribeName
    tribeColor: TribeColor
  };
  pickedBy: LeagueMemberDisplayName | null;
}
