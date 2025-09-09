import { cn } from '~/lib/utils';
import { Flame } from 'lucide-react';
import { CoverCarousel } from '~/components/common/carousel';
import PredictionTimingHelp from '~/components/leagues/actions/events/predictions/timingHelp';
import SubmissionCard from '~/components/leagues/actions/events/predictions/submission';
import { BaseEventDescriptions, BaseEventFullName, BasePredictionReferenceTypes } from '~/lib/events';
import { type MakePredictionsProps } from '~/components/leagues/actions/events/predictions/view';
import { type ScoringBaseEventName, type ReferenceType, type MakePrediction } from '~/types/events';
import { useCallback, useMemo } from 'react';

export default function PredictionCards({
  rules,
  predictionRuleCount,
  predictionsMade,
  castaways,
  tribes,
  className
}: MakePredictionsProps) {

  const enabledBasePredictions = useMemo(() =>
    Object.entries(rules?.basePrediction ?? {})
      .filter(([_, rule]) => rule.enabled)
      .map(([baseEventName, rule]) => {
        const eventName = baseEventName as ScoringBaseEventName;
        const fullName = BaseEventFullName[baseEventName as ScoringBaseEventName] ?? baseEventName;
        const prediction: MakePrediction = {
          eventSource: 'Base' as const,
          eventName: eventName,
          label: fullName,
          description: `${BaseEventDescriptions.prediction[eventName]} \
            ${BaseEventDescriptions.italics[eventName] ?? ''}`,
          points: rule.points,
          referenceTypes: BasePredictionReferenceTypes[eventName],
          timing: rule.timing,
          predictionMade: predictionsMade.find((pred) =>
            pred.eventName === eventName) ?? null,
          shauhinEnabled: rules?.shauhinMode?.enabled && rules.shauhinMode.enabledBets.includes(eventName)
        };
        return prediction;
      }), [rules, predictionsMade]);

  const customPredictions: MakePrediction[] = useMemo(() =>
    rules?.custom
      .map((rule) => ({
        eventSource: 'Custom' as const,
        eventName: rule.eventName,
        label: rule.eventName,
        description: rule.description,
        points: rule.points,
        referenceTypes: rule.referenceTypes,
        timing: rule.timing,
        predictionMade: predictionsMade.find((pred) =>
          pred.eventName === rule.eventName) ?? null,
      })) ?? [], [rules, predictionsMade]);

  const getOptions = useCallback((referenceTypes: ReferenceType[]) => {
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
        const tribe = castaway.tribe;
        options.Castaway[castaway.fullName] = {
          id: castaway.castawayId,
          color: tribe?.color ?? '#AAAAAA',
          tribeName: tribe?.name ?? 'No Tribe'
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
  }, [castaways, tribes]);

  if (predictionRuleCount === 0) return null;
  if (predictionRuleCount === 1) {
    const prediction = enabledBasePredictions[0] ?? customPredictions[0]!;
    return (
      <article
        className={cn('flex flex-col mx-2 text-center bg-secondary rounded-lg min-w-96', className)}>
        <span className='flex gap-1 items-start self-center px-1'>
          <h3 className='text-lg font-semibold text-card-foreground'>
            {prediction.label}
          </h3>
          -
          <div className='inline-flex mt-1'>
            <p className='text-sm'>{prediction.points}</p>
            <Flame size={16} />
          </div>
        </span>
        <p className='text-sm'>{prediction.description}</p>
        <SubmissionCard
          prediction={prediction}
          options={getOptions(prediction.referenceTypes)}
          maxBet={rules?.shauhinMode?.enabled ? rules.shauhinMode.maxBet : undefined}
        />
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
        options={getOptions(prediction.referenceTypes)}
        maxBet={rules?.shauhinMode?.enabled ? rules.shauhinMode.maxBet : undefined}
      />
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
        options={getOptions(prediction.referenceTypes)}
        maxBet={rules?.shauhinMode?.enabled ? rules.shauhinMode.maxBet : undefined} />
    ),
  }));

  return (
    <span className={cn('w-full', className)}>
      <CoverCarousel items={[...basePredictionItems, ...customPredictionItems]} />
    </span>
  );
}
