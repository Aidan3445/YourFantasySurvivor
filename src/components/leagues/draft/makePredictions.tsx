'use client';

import { z } from 'zod';
import { cn } from '~/lib/utils';
import { Button } from '~/components/common/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '~/components/common/form';
import { Flame, HelpCircle } from 'lucide-react';
import {
  type ReferenceType, type BasePredictionRules, defaultPredictionRules,
  BaseEventDescriptions, type ScoringBaseEventName, BasePredictionReferenceTypes,
  type BasePredictionDraft, type LeaguePredictionDraft,
  BaseEventFullName
} from '~/types/events';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/common/select';
import type { CastawayDetails, CastawayDraftInfo } from '~/types/castaways';
import { makePrediction } from '~/app/api/leagues/actions';
import { useLeague } from '~/hooks/useLeague';
import type { Tribe } from '~/types/tribes';
import { ColorRow } from '~/components/leagues/predraft/draftOrder';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { PopoverArrow } from '@radix-ui/react-popover';
import { useMemo } from 'react';
import { Input } from '~/components/common/input';
import { CoverCarousel } from '~/components/common/carousel';

interface MakePredictionsProps {
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

export function PredictionCards({
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

const formSchema = z.object({
  referenceId: z.coerce.number(),
  bet: z.coerce.number().nullable().optional(),
});

interface SubmissionCardProps {
  prediction: LeaguePredictionDraft;
  options: Record<ReferenceType, Record<string, { id: number, color: string, tribeName?: string }>>;
}

function SubmissionCard({ prediction, options }: SubmissionCardProps) {
  const { league, refresh } = useLeague();

  const schema = useMemo(() => {
    return formSchema.extend({
      bet: z.coerce.number()
        .min(0, 'Bet must be a positive number')
        .max(league.shauhinModeSettings?.maxBet ?? 1000, 'Bet exceeds maximum allowed')
        .default(0)
        .optional(),
    });
  }, [league.shauhinModeSettings?.maxBet]);

  const reactForm = useForm<z.infer<typeof schema>>({
    defaultValues: {
      referenceId: prediction.predictionMade?.referenceId,
      bet: prediction.predictionMade?.bet ?? undefined,
    },
    resolver: zodResolver(schema),
  });

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      const selectedType = Object.keys(options).find((type) =>
        Object.values(options[type as ReferenceType]).some(({ id }) =>
          id === data.referenceId)) as ReferenceType | undefined;
      if (!selectedType) throw new Error('Invalid reference type');

      await makePrediction(
        league.leagueHash,
        prediction,
        selectedType,
        data.referenceId,
        data.bet
      );
      await refresh();
      alert('Prediction submitted');
    } catch (error) {
      console.error(error);
      alert('Failed to submit prediction');
    }
  });

  const shauhinEnabled = league.shauhinModeSettings?.enabled &&
    league.shauhinModeSettings.enabledBets
      .includes(prediction.eventName as ScoringBaseEventName);

  return (
    <Form {...reactForm}>
      <form action={() => handleSubmit()}>
        <span className='grid lg:grid-cols-6 grid-cols-1 gap-2 items-center py-2 px-4'>
          <FormField
            name='referenceId'
            render={({ field }) => (
              <FormItem className={shauhinEnabled ? 'lg:col-span-3' : 'lg:col-span-4'}>
                <FormLabel className='sr-only'>Prediction</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={`${field.value ?? ''}`}>
                    <SelectTrigger className=''>
                      <SelectValue placeholder='Select prediction' />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(options).map(([referenceType, references]) => (
                        Object.keys(references).length === 0 ? null : (
                          <SelectGroup key={referenceType}>
                            <SelectLabel>{referenceType}s</SelectLabel>
                            {Object.entries(references)
                              .sort(([name, vals], [name2, vals2]) =>
                                vals.tribeName?.localeCompare(vals2.tribeName ?? '') ??
                                name.localeCompare(name2))
                              .map(([name, vals]) => (
                                referenceType === 'Tribe' ?
                                  <SelectItem key={vals.id} value={`${vals.id}`}>
                                    <ColorRow
                                      className='w-20 px-0 justify-center leading-tight'
                                      color={vals.color}>
                                      {name}
                                    </ColorRow>
                                  </SelectItem> :
                                  <SelectItem key={vals.id} value={`${vals.id}`}>
                                    <span className='flex items-center gap-1'>
                                      <ColorRow
                                        className='w-20 px-0 justify-center leading-tight'
                                        color={vals.color}>
                                        {vals.tribeName}
                                      </ColorRow>
                                      {name}
                                    </span>
                                  </SelectItem>
                              ))}
                          </SelectGroup>
                        )))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )} />
          {shauhinEnabled && (
            <FormField
              name='bet'
              render={({ field: betField }) => (
                <FormItem className='relative col-span-2'>
                  <FormLabel className='sr-only'>Bet</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Enter bet'
                      {...betField}
                      value={betField.value as string ?? ''}
                    />
                  </FormControl>
                  <Popover>
                    <PopoverTrigger className='absolute -translate-y-1/2 top-1/2 right-8'>
                      <HelpCircle size={12} />
                    </PopoverTrigger >
                    <PopoverContent className='w-80'>
                      <PopoverArrow />
                      <h3 className='text-lg font-semibold'>Shauhin Mode</h3>
                      <p className='text-sm'>
                        If your prediction is correct, you will earn the bet amount in points.
                        Miss it, and you lose the bet amount.<br />
                        Bets are limited to a maximum of {league.shauhinModeSettings?.maxBet ?? 1000} points.<br />
                        <br />
                        <b>Note:</b> Bets are only available for certain predictions as defined in the league settings.
                        <br /><br />
                        Good luck!
                      </p>
                    </PopoverContent>
                  </Popover >
                </FormItem >
              )
              } />
          )}
          <Button
            className={cn(shauhinEnabled ? 'lg:col-span-1' : 'lg:col-span-2', 'w-full')}
            disabled={!reactForm.formState.isDirty || reactForm.formState.isSubmitting}
            type='submit'>
            {prediction.predictionMade ?? reactForm.formState.isSubmitSuccessful
              ? 'Update' : 'Submit'}
          </Button>
        </span >
      </form >
    </Form >
  );
}

export function PredictionTimingHelp() {
  return (
    <Popover modal>
      <PopoverTrigger>
        <HelpCircle size={16} className='inline-block' />
      </PopoverTrigger>
      <PopoverContent className='w-80 md:w-full'>
        <PopoverArrow />
        <h3 className='text-lg font-semibold'>Prediction Timing</h3>
        <p className='text-sm'>
          Prediction timing determines when players make their predictions. Predictions can be set at various points in the season:
        </p>
        <ScrollArea className='max-h-40'>
          <ul className='list-disc pl-4 text-sm'>
            <li><b>Draft</b> – Predictions are locked in when players draft their teams, before the league starts.</li>
            <li><b>Weekly</b> – Predictions are made each week. Can apply to:
              <ul className='list-[revert] pl-4'>
                <li><b className='font-semibold'>Full Season</b> – Every week from premiere to finale.</li>
                <li><b className='font-semibold'>Pre-Merge Only</b> – Weekly predictions end once the tribes merge.</li>
                <li><b className='font-semibold'>Post-Merge Only</b> – Weekly predictions start after the merge.</li>
              </ul>
            </li>
            <li><b>Merge</b> – Predictions are made right after the merge episode airs.</li>
            <li><b>Finale</b> – Predictions are made just before the final episode.</li>
          </ul>
          <ScrollBar orientation='vertical' />
        </ScrollArea>
        <p className='text-sm'>
          A prediction may be required at multiple points (e.g., Draft, Merge, and Finale).
        </p>
      </PopoverContent>
    </Popover>
  );
}
