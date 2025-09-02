import { type LeagueMemberRoles } from '~/lib/leagues';

export type LeagueMemberRole = (typeof LeagueMemberRoles)[number];

export type LeagueMember = {
  memberId: number;
  displayName: string;
  color: string;
  role: LeagueMemberRole;
  draftOrder: number;
};

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
