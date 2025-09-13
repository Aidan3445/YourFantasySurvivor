'use client';

import { z } from 'zod';
import { cn } from '~/lib/utils';
import { Button } from '~/components/common/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '~/components/common/form';
import { HelpCircle, RotateCcw } from 'lucide-react';
import { type ReferenceType, type MakePrediction } from '~/types/events';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/common/select';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { useEffect, useMemo } from 'react';
import { Input } from '~/components/common/input';
import ColorRow from '~/components/shared/colorRow';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useQueryClient } from '@tanstack/react-query';
import makePrediction from '~/actions/makePrediction';
import { useCarousel } from '~/components/common/carousel';

const formSchema = z.object({
  referenceId: z.coerce.number(),
  bet: z.coerce.number().nullable().optional(),
});

interface SubmissionCardProps {
  prediction: MakePrediction;
  options: Record<ReferenceType, Record<string, { id: number, color: string, tribeName?: string }>>;
  maxBet?: number;
  wallet?: number;
  updateBetTotal: (eventName: string, bet: number) => void;
  totalBet?: number;
}

export default function SubmissionCard({ wallet, prediction, options, maxBet, updateBetTotal, totalBet }: SubmissionCardProps) {
  const queryClient = useQueryClient();
  const { data: league } = useLeague();
  const { canScrollNext, scrollNext } = useCarousel();

  const schema = useMemo(() => {
    return formSchema.extend({
      bet: z.coerce.number()
        .min(0, 'Bet must be a positive number')
        // note we want to fallback to 1000 if maxBet is undefined OR 0
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        .max(maxBet || 1000, 'Bet exceeds maximum allowed')
        .default(0)
        .optional(),
    });
  }, [maxBet]);

  const reactForm = useForm<z.infer<typeof schema>>({
    defaultValues: {
      referenceId: prediction.predictionMade?.referenceId,
      bet: prediction.predictionMade?.bet ?? undefined,
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!prediction?.predictionMade) return;
    reactForm.reset({
      referenceId: prediction.predictionMade?.referenceId,
      bet: prediction.predictionMade?.bet ?? undefined,
    });
    updateBetTotal(prediction.eventName, prediction.predictionMade?.bet ?? 0);
  }, [prediction?.predictionMade, reactForm, prediction.eventName, updateBetTotal]);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    if (!league) return;

    try {
      const selectedType = Object.keys(options).find((type) =>
        Object.values(options[type as ReferenceType]).some(({ id }) =>
          id === data.referenceId)) as ReferenceType | undefined;
      if (!selectedType) throw new Error('Invalid reference type');

      const { success, reason } = await makePrediction(league?.hash, {
        eventSource: prediction.eventSource,
        eventName: prediction.eventName,
        referenceType: selectedType,
        referenceId: data.referenceId,
        bet: data.bet ?? null,
      });

      if (!success) {
        alert(`Failed to submit prediction${reason ? `: ${reason}` : ''}`);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ['basePredictions', league?.hash] });
      await queryClient.invalidateQueries({ queryKey: ['customEvents', league?.hash] });
      reactForm.reset(data);

      alert('Prediction submitted');

      if (canScrollNext) scrollNext();
    } catch (error) {
      console.error(error);
      alert('Failed to submit prediction');
      reactForm.setError('root', { message: (error as Error).message });
    }
  });

  return (
    <Form {...reactForm}>
      <form action={() => handleSubmit()}>
        <span className='grid grid-cols-[min-content_1fr] items-center pl-4'>
          <RotateCcw
            className={cn('cursor-pointer hover:text-primary transition-all',
              !reactForm.formState.isDirty && 'opacity-50 cursor-not-allowed')}
            size={16}
            onClick={() => {
              reactForm.reset();
              reactForm.setValue('bet', prediction.predictionMade?.bet ?? undefined);
              updateBetTotal(prediction.eventName, prediction.predictionMade?.bet ?? 0);
            }} />
          <span className='grid lg:grid-cols-6 grid-cols-1 gap-2 items-center py-2 px-4'>
            <FormField
              name='referenceId'
              render={({ field }) => (
                <FormItem className={prediction.shauhinEnabled && !!wallet ? 'lg:col-span-3' : 'lg:col-span-4'}>
                  <FormLabel className='sr-only'>Prediction</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?
                        String(field.value) :
                        prediction.predictionMade ? String(prediction.predictionMade.referenceId) : undefined}>
                      <SelectTrigger className={cn(reactForm.formState.isDirty &&
                        field.value !== prediction?.predictionMade?.referenceId &&
                        'bg-amber-400')}>
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
            {prediction.shauhinEnabled && !!wallet && (
              <FormField
                name='bet'
                render={({ field: betField }) => (
                  <FormItem className='relative col-span-2'>
                    <FormLabel className='sr-only'>Bet</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(reactForm.formState.isDirty &&
                          betField.value !== prediction?.predictionMade?.bet &&
                          'bg-amber-400')}
                        type='number'
                        placeholder='Enter bet'
                        min={0}
                        // note we want to fallback to 1000 if maxBet is undefined OR 0
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        max={maxBet || 1000}
                        {...betField}
                        value={(betField.value ?? prediction.predictionMade?.bet ?? '') as number}
                        onChange={(e) => {
                          const val = e.target.value;
                          // note we want to fallback to 1000 if maxBet is undefined OR 0
                          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                          const num = val === '' ? '' : Math.max(0, Math.min(Number(val), maxBet || 1000)) || 0;
                          betField.onChange(num);
                          updateBetTotal(prediction.eventName, num || 0);
                        }}
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
                          Bets are limited to a maximum of {maxBet ?? 1000} points.<br />
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
              className={cn(prediction.shauhinEnabled && !!wallet ? 'lg:col-span-1' : 'lg:col-span-2', 'w-full')}
              disabled={
                !reactForm.formState.isDirty ||
                reactForm.formState.isSubmitting ||
                (prediction.shauhinEnabled && (wallet ?? 0) - (totalBet ?? 0) < 0)
              }
              type='submit'>
              {prediction.predictionMade && !reactForm.formState.errors.root
                ? 'Update' : 'Submit'}
            </Button>
          </span>
        </span>
      </form>
    </Form>
  );
}
