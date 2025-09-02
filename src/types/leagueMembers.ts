import { type LeagueMemberRoles } from '~/lib/leagues';

export type LeagueMemberRole = (typeof LeagueMemberRoles)[number];

export type LeagueMember = {
  memberId: number;
  displayName: string;
  color: string;
  role: LeagueMemberRole;
  draftOrder: number;
};
