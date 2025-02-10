import { z } from 'zod';

export const DISPLAY_NAME_MAX_LENGTH = 16;
export const DisplayNameZod = z.string().min(2).max(DISPLAY_NAME_MAX_LENGTH);
export const ColorZod = z.string().regex(/^#[0-9a-f]{6}$/i);

export const LeagueMemberRoleOptions = ['owner', 'admin', 'member'] as const;
export type LeagueMemberRole = typeof LeagueMemberRoleOptions[number];

export interface NewLeagueMember {
  displayName: string;
  color: string;
  role: LeagueMemberRole;
}

export interface LeagueMember extends NewLeagueMember {
  memberId: number;
}

export interface Member {
  memberId: number;
  displayName: string;
  color: string;
  role: LeagueMemberRole;
  loggedIn: boolean;
  picks: {
    name: string;
    elimWhilePicked: boolean;
  }[];
}
export interface Selection {
  member: string;
  episode: number;
  castaway: string;
}
