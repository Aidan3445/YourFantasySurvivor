import { z } from 'zod';
import { type CastawayName } from '~/types/castaways';
import { type EpisodeNumber } from '~/types/episodes';

export const DISPLAY_NAME_MAX_LENGTH = 16;
export const DisplayNameZod = z.string().min(2).max(DISPLAY_NAME_MAX_LENGTH);
export const ColorZod = z.string().regex(/^#[0-9a-f]{6}$/i);

export const LeagueMemberRoleOptions = ['Owner', 'Admin', 'Member'] as const;
export type LeagueMemberRole = typeof LeagueMemberRoleOptions[number];

export type LeagueMemberDisplayName = string;
export type LeagueMemberColor = string;


export interface NewLeagueMember {
  displayName: LeagueMemberDisplayName;
  color: LeagueMemberColor;
  role: LeagueMemberRole;
}

export type LeagueMemberId = number;

export interface LeagueMember extends NewLeagueMember {
  memberId: LeagueMemberId;
}

export type LeagueMemberStatus = boolean;
export type LeagueMemberPickElim = boolean;

export interface Member {
  memberId: LeagueMemberId;
  displayName: LeagueMemberDisplayName;
  color: LeagueMemberColor;
  role: LeagueMemberRole;
  loggedIn: LeagueMemberStatus;
  picks: {
    name: CastawayName;
    elimWhilePicked: LeagueMemberPickElim;
  }[];
}
export interface Selection {
  member: LeagueMemberId;
  episode: EpisodeNumber;
  castaway: CastawayName;
}

export interface LeagueMembersDraftInfo {
  memberId: number;
  displayName: string;
  color: string;
  draftPick: string | null;
}