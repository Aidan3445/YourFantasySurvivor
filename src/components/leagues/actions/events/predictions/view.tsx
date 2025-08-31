import {
  type BasePredictionRules, defaultPredictionRules,
  type BasePredictionDraft, type LeaguePredictionDraft,
} from '~/types/events';
import type { CastawayDetails, CastawayDraftInfo } from '~/types/castaways';
import type { Tribe } from '~/types/tribes';
import PredictionCards from '~/components/leagues/actions/events/predictions/cards';

export interface MakePredictionsProps {
  basePredictionRules?: BasePredictionRules;
  basePredictions?: BasePredictionDraft[];
  customPredictions?: LeaguePredictionDraft[];
  castaways: (CastawayDraftInfo | CastawayDetails)[];
  tribes: Tribe[];
  className?: string;
}

export default function MakePredictions({
  basePredictionRules = defaultPredictionRules,
  basePredictions = [],
  customPredictions = [],
  castaways,
  tribes
}: MakePredictionsProps) {
  const enabledBasePredictions = Object.values(basePredictionRules)
    .reduce((count, event) => count + Number(event.enabled), 0);
  if (customPredictions.length + enabledBasePredictions === 0) return null;

  return (
    <div className='bg-card rounded-lg text-center flex flex-col items-center'>
      <h3 className='text-xl font-semibold'>While you wait...</h3>
      <p>
        Make your prediction{customPredictions.length > 1 ? 's! Earn  points throughout the season for\
        each correct prediction you make.' : ' and earn points if you are correct!'}
      </p>
      <PredictionCards
        basePredictionRules={basePredictionRules}
        basePredictions={basePredictions}
        customPredictions={customPredictions}
        castaways={castaways}
        tribes={tribes} />
    </div>
  );
}
