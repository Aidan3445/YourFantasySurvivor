import { type ScoringBaseEventName, type BaseEventName, type ReferenceType } from '~/types/events';

export const EventSources = ['Base', 'Custom'] as const;
export const EventTypes = ['Direct', 'Prediction'] as const;
export const ReferenceTypes = ['Castaway', 'Tribe'] as const;

export const EliminationEventNames = ['elim', 'noVoteExit'] as const;
export const ScoringBaseEventNames = [
  'advFound', 'advPlay', 'badAdvPlay', 'advElim', 'spokeEpTitle', 'tribe1st',
  'tribe2nd', 'indivWin', 'indivReward', 'finalists', 'fireWin', 'soleSurvivor',
  'elim'
] as const;

export const BaseEventNames = [
  ...ScoringBaseEventNames,
  'noVoteExit',
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

export const BaseEventLabelPrefixes: Record<BaseEventName, string> = {
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

export const BaseEventLabels: Record<BaseEventName, readonly [string, ...string[]]> = {
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
  noVoteExit: ['Med Evacuation', 'Quit', 'Removed'],
  tribeUpdate: ['Starting Tribes', 'Merge Tribe', 'Tribe Swap', 'New Tribes'],
  otherNotes: ['Other Notes']
} as const;

export const BaseEventDescriptions: {
  main: Record<ScoringBaseEventName, string>,
  prediction: Record<ScoringBaseEventName, string>,
  italics: Partial<Record<ScoringBaseEventName, string>>
} = {
  main: {
    indivWin: 'Points if your survivor wins an individual immunity challenge',
    indivReward: 'Points if your survivor wins an individual reward challenge',
    tribe1st: 'Points if your survivor’s tribe/team wins a challenge',
    tribe2nd: 'Points if your survivor’s tribe/team comes second in a challenge',
    advFound: 'Points if your survivor finds or earns an advantage',
    advPlay: 'Points if your survivor plays an advantage effectively',
    badAdvPlay: 'Points if your survivor plays an advantage poorly or unnecessarily',
    advElim: 'Points if your survivor is eliminated with an advantage in their pocket',
    spokeEpTitle: 'Points if your survivor is quoted in the episode title',
    finalists: 'Points if your survivor makes it to the final tribal council',
    fireWin: 'Points if your survivor wins the fire-making challenge',
    soleSurvivor: 'Points if your survivor wins the season',
    elim: 'Points if your survivor is eliminated at tribal council',
  },
  prediction: {
    indivWin: 'Predict which castaway will win an individual immunity challenge',
    indivReward: 'Predict which castaway will win an individual reward challenge',
    tribe1st: 'Predict which tribe/team will win a challenge',
    tribe2nd: 'Predict which tribe/team will come second in a challenge',
    advFound: 'Predict which castaway will find or earn an advantage',
    advPlay: 'Predict which castaway will play an advantage effectively',
    badAdvPlay: 'Predict which castaway will play an advantage poorly or unnecessarily',
    advElim: 'Predict which castaway will be eliminated with an advantage in their pocket',
    spokeEpTitle: 'Predict which castaway will be quoted in the episode title',
    finalists: 'Predict which castaway will make it to the final tribal council',
    fireWin: 'Predict which castaway will win the fire-making challenge',
    soleSurvivor: 'Predict which castaway will win the season',
    elim: 'Predict which castaway will be voted out at tribal council',
  },
  italics: {
    tribe2nd: '(only applies for challenges with 3+ tribes/teams)',
    badAdvPlay: '(usually negative)',
    advElim: '(usually negative)',
    elim: '(includes med evacs, quits, and removals)',
  },
};

export const BasePredictionReferenceTypes: Record<ScoringBaseEventName, ReferenceType[]> = {
  advFound: ['Castaway'],
  advPlay: ['Castaway'],
  badAdvPlay: ['Castaway'],
  advElim: ['Castaway'],
  spokeEpTitle: ['Castaway'],
  tribe1st: ['Tribe'],
  tribe2nd: ['Tribe'],
  indivWin: ['Castaway'],
  indivReward: ['Castaway'],
  finalists: ['Castaway'],
  fireWin: ['Castaway'],
  soleSurvivor: ['Castaway'],
  elim: ['Castaway'],
} as const;
