import { type BaseEventRules } from '~/types/leagues';

export const LeagueStatuses = ['Predraft', 'Draft', 'Active', 'Inactive'] as const;
export const LeagueMemberRoles = ['Owner', 'Admin', 'Member'] as const;
export const ShauhinModeTimings = ['Premiere', 'After Merge', 'Before Finale', 'Custom'] as const;

export const LEAGUE_NAME_MIN_LENGTH = 3;
export const LEAGUE_NAME_MAX_LENGTH = 64;
export const DEFAULT_SURVIVAL_CAP = 5;
export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 32;

export const defaultBaseRules: BaseEventRules = {
  advFound: 5,
  advPlay: 10,
  badAdvPlay: -5,
  advElim: -7,
  spokeEpTitle: 2,
  tribe1st: 2,
  tribe2nd: 1,
  indivWin: 10,
  indivReward: 5,
  finalists: 5,
  fireWin: 5,
  soleSurvivor: 10,
};
