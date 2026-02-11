import { type LeagueMemberRole } from '~/types/leagueMembers';
import { type LeagueStatus } from '~/types/leagues';

export type LeagueRouteParams = {
  params: Promise<{ hash: string }>
}

export type LeagueMemberAuth = {
  userId: string | null;
  memberId: number | null;
  role: LeagueMemberRole | null;
  leagueId: number | null;
}

export type VerifiedLeagueMemberAuth = {
  userId: string;
  memberId: number;
  role: LeagueMemberRole;
  leagueId: number;
  status: LeagueStatus;
  startWeek: number | null;
  seasonId: number;
}
