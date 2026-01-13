import { Card, CardHeader } from '~/components/common/card';
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
  wallet?: number;
  totalBet?: number;
  setBetTotal?: (_betTotal: number) => void;
  className?: string;
}

export default function MakePredictions(props: MakePredictionsProps) {
  if (!props.rules || props.predictionRuleCount === 0) return null;


  return (
    <Card className='p-0 pt-4 border-2 border-primary/20 relative'>
      {/* Accent Elements */}
      <div className='absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl' />

      <CardHeader className='px-4 flex items-center gap-3 mb-2'>
        <div className='h-6 w-1 bg-primary rounded-full' />
        <h2 className='text-2xl font-black uppercase tracking-wider text-card-foreground relative z-10'>
          While you wait...
        </h2>
      </CardHeader>
      <p className='font-medium relative z-10'>
        Make your prediction{props.predictionRuleCount > 1 ? 's! Earn points throughout the season for\
        each correct prediction you make.' : ' and earn points if you are correct!'}
      </p>
      <PredictionCards {...props} />
    </Card>
  );
}
