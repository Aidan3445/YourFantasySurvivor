import { type BaseEventName } from '~/types/events';

export const EventSources = ['Base', 'Custom'] as const;
export const EventTypes = ['Direct', 'Prediction'] as const;
export const ReferenceTypes = ['Castaway', 'Tribe'] as const;

export const ScoringBaseEventNames = [
  'advFound', 'advPlay', 'badAdvPlay', 'advElim', 'spokeEpTitle', 'tribe1st', 'tribe2nd',
  'indivWin', 'indivReward', 'finalists', 'fireWin', 'soleSurvivor'] as const;

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
