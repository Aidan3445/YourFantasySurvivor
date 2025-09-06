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

export const baseEventLabelPrefixes: Record<BaseEventName, string> = {
  advFound: 'Found',
  advPlay: 'Correctly played',
  badAdvPlay: 'Incorrectly played',
  advElim: 'Eliminated with',
  spokeEpTitle: '',
  tribe1st: '1st',
  tribe2nd: '2nd',
  indivWin: 'Won',
  indivReward: 'Won',
  finalists: '',
  fireWin: '',
  soleSurvivor: '',
  elim: '',
  noVoteExit: '',
  tribeUpdate: '',
  otherNotes: ''
} as const;


const advList = ['Advantage', 'Idol', 'Beware Advantage', 'Extra Vote', 'Block a Vote', 'Steal a Vote',
  'Safety Without Power', 'Idol Nullifier', 'Challenge Advantage', 'Knowledge is Power'] as const;

export const baseEventLabels: Record<BaseEventName, readonly [string, ...string[]]> = {
  advFound: advList,
  advPlay: [...advList, 'Shot in the Dark'],
  badAdvPlay: [...advList, 'Shot in the Dark'],
  advElim: advList,
  spokeEpTitle: ['Spoke Episode Title'],
  tribe1st: ['Tribe Immunity and Reward', 'Tribe Immunity', 'Tribe Reward'],
  tribe2nd: ['Tribe Immunity and Reward', 'Tribe Immunity', 'Tribe Reward'],
  indivWin: ['Individual Immunity and Reward', 'Individual Immunity'],
  indivReward: ['Individual Reward'],
  finalists: ['Final 3', 'Final 2'],
  fireWin: ['Won Fire Making'],
  soleSurvivor: ['Sole Survivor'],
  elim: ['Voted Out', 'Blindside', 'Rock Draw'],
  noVoteExit: ['Lost Fire Making', 'Quit', 'Medevac', 'Removed'],
  tribeUpdate: ['Starting Tribes', 'Merge Tribe', 'Tribe Swap', 'New Tribes'],
  otherNotes: ['Other Notes']
} as const;
