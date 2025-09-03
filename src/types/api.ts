import { type LeagueMemberRole } from '~/types/leagueMembers';

export type LeagueRouteParams = {
  params: Promise<{ hash: string }>
}

export type LeagueMemberAuth = {
  userId: string | null;
  memberId: number | null;
  role: LeagueMemberRole | null;
}

export type VerifiedLeagueMemberAuth = {
  userId: string;
  memberId: number;
  role: LeagueMemberRole;
}
