import { type BaseEventName } from '~/types/events';
import { type BaseEventPredictionRules } from '~/types/leagues';

export const EventSources = ['Base', 'Custom'] as const;
export const EventTypes = ['Direct', 'Prediction'] as const;
export const ReferenceTypes = ['Castaway', 'Tribe'] as const;

export const ScoringBaseEventNames = [
  'advFound', 'advPlay', 'badAdvPlay', 'advElim', 'spokeEpTitle', 'tribe1st',
  'tribe2nd', 'indivWin', 'indivReward', 'finalists', 'fireWin', 'soleSurvivor'
] as const;

export const EliminationEventNames = ['elim', 'noVoteExit'] as const;

export const BaseEventNames = [
  ...ScoringBaseEventNames,
  ...EliminationEventNames,
  'tribeUpdate', 'otherNotes'] as const;

export const BaseEventFullName: Record<BaseEventName, string> = {
  advFound: 'Advantage Found',
  advPlay: 'Advantage Played',
  badAdvPlay: 'Bad Advantage Play',
  advElim: 'Advantage Eliminated',
  spokeEpTitle: 'Spoke Episode Title',
  tribe1st: 'Tribe/Team 1st',
  tribe2nd: 'Tribe/Team 2nd',
  indivWin: 'Individual Immunity',
  indivReward: 'Individual Reward',
  finalists: 'Finalists',
  fireWin: 'Fire Making Challenge',
  soleSurvivor: 'Sole Survivor',
  elim: 'Eliminated',
  noVoteExit: 'No Vote Exit',
  tribeUpdate: 'Tribe Update',
  otherNotes: 'Other Notes'
};

export const PredictionTimings = [
  'Draft', 'Weekly', 'After Merge', 'Before Finale',
  'Weekly (Premerge only)', 'Weekly (Postmerge only)'
] as const;

export const defaultPredictionRules: BaseEventPredictionRules = {
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
    pickCount: 3
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
  }
};

