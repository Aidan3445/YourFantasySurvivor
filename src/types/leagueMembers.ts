import z from 'zod';
import { DISPLAY_NAME_MAX_LENGTH, DISPLAY_NAME_MIN_LENGTH, type LeagueMemberRoles } from '~/lib/leagues';

export type LeagueMemberRole = (typeof LeagueMemberRoles)[number];

export type LeagueMember = {
  memberId: number;
  displayName: string;
  color: string;
  role: LeagueMemberRole;
  draftOrder: number;
  loggedIn: boolean;
};

export type LeagueMemberInsert = {
  displayName: string;
  color: string;
};

export const DisplayNameZod = z.string()
  .min(DISPLAY_NAME_MIN_LENGTH, { message: `Display name must be between ${DISPLAY_NAME_MIN_LENGTH} and ${DISPLAY_NAME_MAX_LENGTH} characters` })
  .max(DISPLAY_NAME_MAX_LENGTH, { message: `Display name must be between ${DISPLAY_NAME_MIN_LENGTH} and ${DISPLAY_NAME_MAX_LENGTH} characters` });
export const ColorZod = z.string().regex(/^#[0-9a-f]{6}$/i);


export type LeagueMemberStatus = {
  currentCastawayId: number | null;
  currentCastaway: string | null;
  isEliminated: boolean;
};

export type SelectionUpdate = {
  episodeNumber: number;
  memberId: number;
  castawayId: number;
  draft: boolean;
};

export type CurrentSelection = {
  castawayId: number;
  fullName: string;
  isEliminated: boolean;
};
