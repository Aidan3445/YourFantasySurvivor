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
    const options: Record<ReferenceType, Record<string, number>> = {
      Castaway: {},
      Tribe: {},
    };

    if (referenceTypes.length === 0 || referenceTypes.includes('Castaway')) {
      castaways.forEach((castaway) => {
        options.Castaway[castaway.fullName] = castaway.castawayId;
      });
    }
    if (referenceTypes.length === 0 || referenceTypes.includes('Tribe')) {
      tribes.forEach((tribe) => {
        options.Tribe[tribe.tribeName] = tribe.tribeId;
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
      <CarouselContent className='w-min lg:w-auto'>
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
                  '-translate-x-1/2': index === (current) % (predictions.length * 5),
                  'translate-x-1/2': index === (current - 2) % (predictions.length * 5),
                  '-translate-x-8': index + current + 1 === 2 * predictions.length * 5
                })} >
              <span className='flex w-min gap-1 items-start self-center px-1 lg:w-full'>
                <CarouselPrevious className='static min-w-8 translate-y-0 mt-1 ml-1 mr-auto' />
                <span>
                  <h3 className='inline text-lg font-semibold text-card-foreground'>
                    {prediction.eventName}
                  </h3>
                  -
                  <p className='inline text-sm'>{prediction.points}</p>
                  <Flame className='inline' size={16} />
                </span>
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
  options: Record<ReferenceType, Record<string, number>>;
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
        Object.values(options[type as ReferenceType]).includes(data.referenceId)) as ReferenceType;
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
                          {Object.entries(references).map(([name, id]) => (
                            <SelectItem key={id} value={`${id}`}>
                              {name}
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

