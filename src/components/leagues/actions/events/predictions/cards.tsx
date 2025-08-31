import { cn } from '~/lib/utils';
import { Flame } from 'lucide-react';
import {
  type ReferenceType, defaultPredictionRules,
  BaseEventDescriptions, type ScoringBaseEventName, BasePredictionReferenceTypes,
  type LeaguePredictionDraft, BaseEventFullName
} from '~/types/events';
import type { CastawayDetails, CastawayDraftInfo } from '~/types/castaways';
import { CoverCarousel } from '~/components/common/carousel';
import { type MakePredictionsProps } from '~/components/leagues/actions/events/predictions/view';
import PredictionTimingHelp from '~/components/leagues/actions/events/predictions/timingHelp';
import SubmissionCard from '~/components/leagues/actions/events/predictions/submission';

export default function PredictionCards({
  basePredictionRules = defaultPredictionRules,
  basePredictions = [],
  customPredictions = [],
  castaways,
  tribes,
  className
}: MakePredictionsProps) {
  const enabledBasePredictions = Object.entries(basePredictionRules)
    .filter(([_, rule]) => rule.enabled)
    .map(([baseEventName, rule]) => {
      const eventName = baseEventName as ScoringBaseEventName;
      const fullName = BaseEventFullName[baseEventName as ScoringBaseEventName] ?? baseEventName;
      const prediction: LeaguePredictionDraft = {
        eventName: eventName,
        label: fullName,
        description: `${BaseEventDescriptions.prediction[eventName]} \
            ${BaseEventDescriptions.italics[eventName] ?? ''}`,
        points: rule.points,
        eventType: 'Prediction',
        referenceTypes: BasePredictionReferenceTypes[eventName],
        timing: rule.timing,
        predictionMade: basePredictions.find((pred) =>
          pred.eventName === eventName)?.predictionMade ?? null,
      };

      return prediction;
    });

  const predictionRuleCount = enabledBasePredictions.length + customPredictions.length;
  if (predictionRuleCount === 0) return null;

  const getOptions = (referenceTypes: ReferenceType[]) => {
    const options: Record<ReferenceType, Record<string, {
      id: number,
      color: string,
      tribeName?: string
    }>> = {
      Castaway: {},
      Tribe: {},
    };

    if (referenceTypes.length === 0 || referenceTypes.includes('Castaway')) {
      castaways.forEach((castaway) => {
        if (castaway.eliminatedEpisode) return;
        const tribe = (castaway as CastawayDraftInfo).tribe ??
          (castaway as CastawayDetails).tribes.slice(-1)[0];
        options.Castaway[castaway.fullName] = {
          id: castaway.castawayId,
          color: tribe.tribeColor,
          tribeName: tribe.tribeName
        };
      });
    }
    if (referenceTypes.length === 0 || referenceTypes.includes('Tribe')) {
      tribes.forEach((tribe) => {
        options.Tribe[tribe.tribeName] = {
          id: tribe.tribeId,
          color: tribe.tribeColor
        };
      });
    }
    return options;
  };

  if (predictionRuleCount === 1) {
    const prediction = (customPredictions[0] ?? enabledBasePredictions[0])!;
    return (
      <article
        className={cn('flex flex-col mx-2 text-center bg-secondary rounded-lg min-w-96', className)}>
        <span className='flex gap-1 items-start self-center px-1'>
          <h3 className='text-lg font-semibold text-card-foreground'>
            {prediction.label ?? prediction.eventName}
          </h3>
          -
          <div className='inline-flex mt-1'>
            <p className='text-sm'>{prediction.points}</p>
            <Flame size={16} />
          </div>
        </span>
        <p className='text-sm'>{prediction.description}</p>
        <SubmissionCard prediction={prediction} options={getOptions(prediction.referenceTypes)} />
      </article>
    );
  }

  const customPredictionItems = customPredictions.map((prediction) => ({
    header: (
      <h3 className='text-lg font-semibold text-card-foreground'>
        {prediction.label ?? prediction.eventName}
        <span className='ml-2 inline-flex mt-1'>
          <p className='text-sm'>{prediction.points}</p>
          <Flame size={16} />
        </span>
        <div className='flex text-xs font-normal italic text-card-foreground justify-center items-center gap-1'>
          {prediction.timing.join(' - ')}
          <PredictionTimingHelp />
        </div>
      </h3>
    ),
    content: (<p className='text-sm bg-b3 py-1'>{prediction.description}</p>),
    footer: (
      <SubmissionCard
        prediction={prediction}
        options={getOptions(prediction.referenceTypes)} />
    ),
  }));

  const basePredictionItems = enabledBasePredictions.map((prediction) => ({
    header: (
      <h3 className='text-lg font-semibold text-card-foreground py-1'>
        {prediction.label ?? prediction.eventName}
        <span className='ml-2 inline-flex mt-1'>
          <p className='text-sm'>{prediction.points}</p>
          <Flame size={16} />
        </span>
        <div className='flex text-xs font-normal italic text-card-foreground justify-center items-center gap-1'>
          {prediction.timing.join(' - ')}
          <PredictionTimingHelp />
        </div>
      </h3>
    ),
    content: (
      <p className='text-sm bg-b3 py-1'>{prediction.description}</p>
    ),
    footer: (
      <SubmissionCard
        prediction={prediction}
        options={getOptions(prediction.referenceTypes)} />
    ),
  }));

  return (
    <span className={cn('w-full', className)}>
      <CoverCarousel items={[...basePredictionItems, ...customPredictionItems]} />
    </span>
  );
}
