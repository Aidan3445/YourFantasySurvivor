import { type BaseEventPredictionRules, type BaseEventRules, type ShauhinModeSettings, type CustomEventRuleInsert } from '~/types/leagues';

export const LeagueStatuses = ['Predraft', 'Draft', 'Active', 'Inactive'] as const;
export const LeagueMemberRoles = ['Owner', 'Admin', 'Member'] as const;
export const ShauhinModeTimings = ['After Premiere', 'After Merge', 'Before Finale', 'Custom'] as const;

export const LEAGUE_NAME_MIN_LENGTH = 3;
export const LEAGUE_NAME_MAX_LENGTH = 64;
export const DEFAULT_SURVIVAL_CAP = 5;
export const MAX_SURVIVAL_CAP = 15;
export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 32;
export const ABS_MAX_EVENT_POINTS = 100;
export const SHAUHIN_MODE_MAX_MAX_BETS_PER_WEEK = 10;

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
  elim: 0,
};

export const defaultNewCustomRule: CustomEventRuleInsert = {
  eventName: '',
  description: '',
  points: 5,
  eventType: 'Direct',
  referenceTypes: ['Castaway'],
  timing: [],
};

export const defaultBasePredictionRules: BaseEventPredictionRules = {
  advFound: {
    enabled: false,
    points: 5,
    timing: ['Draft']
  },
  advPlay: {
    enabled: false,
    points: 3,
    timing: ['Weekly']
  },
  badAdvPlay: {
    enabled: false,
    points: 3,
    timing: ['Weekly']
  },
  advElim: {
    enabled: false,
    points: 3,
    timing: ['Weekly']
  },
  spokeEpTitle: {
    enabled: false,
    points: 2,
    timing: ['Weekly']
  },
  tribe1st: {
    enabled: false,
    points: 5,
    timing: ['Weekly (Premerge only)']
  },
  tribe2nd: {
    enabled: false,
    points: 3,
    timing: ['Weekly (Premerge only)']
  },
  indivWin: {
    enabled: false,
    points: 10,
    timing: ['Weekly (Postmerge only)']
  },
  indivReward: {
    enabled: false,
    points: 5,
    timing: ['Weekly (Postmerge only)']
  },
  finalists: {
    enabled: false,
    points: 3,
    timing: ['Draft', 'After Merge', 'Before Finale'],
  },
  fireWin: {
    enabled: false,
    points: 7,
    timing: ['Before Finale']
  },
  soleSurvivor: {
    enabled: false,
    points: 10,
    timing: ['Draft', 'After Merge', 'Before Finale']
  },
  elim: {
    enabled: false,
    points: 5,
    timing: ['Weekly']
  },
};
export const defaultShauhinModeSettings: ShauhinModeSettings = {
  enabled: false,
  maxBet: ABS_MAX_EVENT_POINTS,
  maxBetsPerWeek: 5,
  startWeek: 'After Merge',
  customStartWeek: 8,
  enabledBets: [
    'indivWin',
    'finalists',
    'fireWin',
    'soleSurvivor'
  ],
};
