'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '~/components/ui/form';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '~/components/ui/carousel';
import { Flame } from 'lucide-react';
import { type ReferenceType, type LeagueEventPrediction } from '~/server/db/defs/events';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/ui/select';
import { type CastawayDetails, type CastawayDraftInfo } from '~/server/db/defs/castaways';
import { makePrediction } from '~/app/api/leagues/actions';
import { useLeague } from '~/hooks/useLeague';
import { type Tribe } from '~/server/db/defs/tribes';
import { ColorRow } from '../draftOrder';

interface MakePredictionsProps {
  predictions: LeagueEventPrediction[];
  castaways: (CastawayDraftInfo | CastawayDetails)[];
  tribes: Tribe[];
  className?: string;
}

export default function MakePredictions({ predictions, castaways, tribes }: MakePredictionsProps) {
  if (predictions.length === 0) return null;

  return (
    <div className='bg-card p-2 rounded-lg text-center flex flex-col items-center'>
      <h3 className='text-xl font-semibold'>While you wait...</h3>
      <p>
        Make your predictions! Earn points throughout the season
        for each correct prediction you make.
      </p>
      <PredictionCards predictions={predictions} castaways={castaways} tribes={tribes} />
    </div>
  );
}

export function PredictionCards({ predictions, castaways, tribes, className }: MakePredictionsProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (predictions.length === 0) return null;

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


  if (predictions.length === 1) {
    const prediction = predictions[0]!;
    return (<article
      className={cn(
        'flex flex-col bg-secondary rounded-lg my-4 text-center transition-transform duration-700',
        className)}>
      <span className='flex gap-1 items-start self-center px-1'>
        <h3 className='text-lg font-semibold text-card-foreground'>
          {prediction.eventName}
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

  return (
    <Carousel className='gap-4 items-center' setApi={setApi} opts={{ align: 'center' }}>
      <CarouselContent className='w-[calc(100svw-5rem)] lg:w-full'>
        {predictions.map((prediction, index) => (
          <CarouselItem key={index} className={cn('basis-[90%] z-10 transition-all', {
            'opacity-50 -z-10': index !== current - 1,
          })}>
            <article
              className={cn(
                'flex flex-col bg-secondary rounded-lg shadow-lg my-4',
                'text-center transition-transform duration-700',
                {
                  'scale-75': index !== current - 1,
                  '-translate-x-1/2': index === current % predictions.length,
                  'translate-x-1/2': index === (current - 2) % predictions.length,
                  '-translate-x-6 md:-translate-x-8': index + current + 1 === 2 * predictions.length,
                  'translate-x-6 md:translate-x-8 lg:translate-x-12': index + current === 1,
                })} >
              <span className='flex gap-4 items-center self-center px-1 lg:w-full'>
                <CarouselPrevious className='static min-w-8 translate-y-0 mt-1 ml-1 mr-auto' />
                <h3 className='inline text-lg font-semibold text-card-foreground'>
                  {prediction.eventName}
                  <span className='ml-2 inline-flex mt-1'>
                    <p className='text-sm'>{prediction.points}</p>
                    <Flame size={16} />
                  </span>
                </h3>
                <CarouselNext className='static min-w-8 translate-y-0 mt-1 mr-1 ml-auto' />
              </span>
              <p className='text-sm'>{prediction.description}</p>
              <SubmissionCard prediction={prediction} options={getOptions(prediction.referenceTypes)} />
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

const formSchema = z.object({
  referenceId: z.coerce.number(),
});

interface SubmissionCardProps {
  prediction: LeagueEventPrediction;
  options: Record<ReferenceType, Record<string, { id: number, color: string, tribeName?: string }>>;
}

function SubmissionCard({ prediction, options }: SubmissionCardProps) {
  const { league, refresh } = useLeague();
  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: { referenceId: prediction.predictionMade?.referenceId },
    resolver: zodResolver(formSchema),
  });

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      const selectedType = Object.keys(options).find((type) =>
        Object.values(options[type as ReferenceType]).some(({ id }) => id === data.referenceId)) as ReferenceType | undefined;
      if (!selectedType) throw new Error('Invalid reference type');

      await makePrediction(league.leagueHash, prediction, selectedType, data.referenceId);
      await refresh();
      alert('Prediction submitted');
    } catch (error) {
      console.error(error);
      alert('Failed to submit prediction');
    }
  });

  return (
    <Form {...reactForm}>
      <form action={() => handleSubmit()}>
        <FormField
          name='referenceId'
          render={({ field }) => (
            <FormItem className='p-2'>
              <FormLabel className='sr-only'>Prediction</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={`${field.value ?? ''}`}>
                  <span className='grid lg:grid-cols-4 grid-cols-1 gap-2'>
                    <SelectTrigger className='lg:col-span-3'>
                      <SelectValue placeholder='Select prediction' />
                    </SelectTrigger>
                    <Button
                      disabled={!field.value}
                      type='submit'>
                      {prediction.predictionMade ? 'Update' : 'Submit'} Prediction
                    </Button>
                  </span>
                  <SelectContent>
                    {Object.entries(options).map(([referenceType, references]) => (
                      Object.keys(references).length === 0 ? null : (
                        <SelectGroup key={referenceType}>
                          <SelectLabel>{referenceType}s</SelectLabel>
                          {Object.entries(references).map(([name, vals]) => (
                            referenceType === 'Tribe' ?
                              <SelectItem key={vals.id} value={`${vals.id}`}>
                                <ColorRow
                                  className='w-10 px-0 justify-center leading-tight'
                                  color={vals.color}>
                                  {name}
                                </ColorRow>
                              </SelectItem> :
                              <SelectItem key={vals.id} value={`${vals.id}`}>
                                <span className='flex items-center gap-1'>
                                  <ColorRow
                                    className='w-10 px-0 justify-center leading-tight'
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
      </form>
    </Form>
  );
}

