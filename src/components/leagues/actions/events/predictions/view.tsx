import PredictionCards from '~/components/leagues/actions/events/predictions/cards';
import { type EnrichedCastaway } from '~/types/castaways';
import { type Prediction } from '~/types/events';
import { type LeagueRules } from '~/types/leagues';
import { type Tribe } from '~/types/tribes';

export interface MakePredictionsProps {
  rules?: LeagueRules;
  predictionRuleCount: number;
  predictionsMade: Prediction[];
  castaways: EnrichedCastaway[];
  tribes: Tribe[];
  className?: string;
}

export default function MakePredictions(props: MakePredictionsProps) {
  if (!props.rules || props.predictionRuleCount === 0) return null;


  return (
    <div className='bg-card rounded-lg text-center flex flex-col items-center'>
      <h3 className='text-xl font-semibold'>While you wait...</h3>
      <p>
        Make your prediction{props.predictionRuleCount > 1 ? 's! Earn  points throughout the season for\
        each correct prediction you make.' : ' and earn points if you are correct!'}
      </p>
      <PredictionCards {...props} />
    </div>
  );
}
