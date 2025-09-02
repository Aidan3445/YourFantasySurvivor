import type { LeagueStatuses } from '~/lib/leagues';

export type LeagueStatus = (typeof LeagueStatuses)[number];

export type League = {
  leagueId: number;
  name: string;
  hash: string;
  status: LeagueStatus;
  season: string;
};


