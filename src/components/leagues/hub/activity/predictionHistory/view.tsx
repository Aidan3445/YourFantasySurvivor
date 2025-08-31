import { CoverCarousel } from '~/components/common/carousel';
import { type EpisodeNumber } from '~/types/episodes';
import { type Prediction } from '~/types/events';
import PredctionTable from '~/components/leagues/hub/activity/predictionHistory/table';

interface MemberPredictionsProps {
  history?: Record<EpisodeNumber, Prediction[]>;
}

export default function PredictionHistory({ history }: MemberPredictionsProps) {
  const predictions = history ?? {};

  const stats = Object.values(predictions).reduce((acc, preds) => {
    preds.forEach((pred) => {
      if (pred.results.some((res) =>
        res.referenceId === pred.prediction.referenceId &&
        res.referenceType === pred.prediction.referenceType)) {
        acc.count.correct++;
        acc.points.earned += pred.points;
        acc.points.earnedBets += pred.prediction.bet ?? 0;
      }
      acc.count.total++;
      acc.points.possible += pred.points;
      acc.points.possibleBets += pred.prediction.bet ?? 0;
    });
    return acc;
  }, {
    count: {
      correct: 0,
      total: 0,
    },
    points: {
      earned: 0,
      possible: 0,
      earnedBets: 0,
      possibleBets: 0,
    }
  });

  if (stats.count.total === 0) return null;

  if (stats.count.total === 1) {
    const prediction = Object.entries(predictions)[0];
    if (!prediction) return null;

    const [episode, preds] = prediction;
    return (
      <div className='text-center bg-card rounded-lg'>
        <h1 className='text-3xl'>Prediction History</h1>
        <span className='flex justify-center items-center gap-2 text-sm'>
          <p className=' text-muted-foreground'>Accuracy: {stats.count.correct}/{stats.count.total}</p>
          <p className=' text-muted-foreground'>Points: {stats.points.earned}/{stats.points.possible}</p>
        </span>
        <article className='flex flex-col bg-card rounded-lg my-4 text-center overflow-hidden'>
          <h2 className='text-2xl'>{`Episode ${episode}`}</h2>
          <PredctionTable predictions={preds} />
        </article>
      </div>
    );
  }

  return (
    <div className='text-center bg-card rounded-lg w-full overflow-clip'>
      <h1 className='text-3xl'>Prediction History</h1>
      <span className='flex justify-center items-center gap-2 text-sm'>
        <p className=' text-muted-foreground'>Accuracy: {stats.count.correct}/{stats.count.total}</p>
        <p className=' text-muted-foreground'>Points: {stats.points.earned}/{stats.points.possible}</p>
      </span>
      <CoverCarousel items={Object.entries(predictions).toReversed().map(([episode, preds]) => ({
        header: (<h2 className='text-2xl leading-loose'>{`Episode ${episode}`}</h2>),
        content: (<PredctionTable predictions={preds} />),
      }))} />
    </div>
  );
}
